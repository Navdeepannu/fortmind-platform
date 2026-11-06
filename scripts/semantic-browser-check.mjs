import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = resolve(process.env.SEMANTIC_OUTPUT || "docs/semantic-system");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, permissions: ["clipboard-read", "clipboard-write"] });
const page = await context.newPage();
const errors = [], warnings = [];
page.on("pageerror", error => errors.push(`${page.url()}: ${error.message}`));
page.on("console", msg => { if (msg.type() === "error") errors.push(`${page.url()}: ${msg.text()}`); if (msg.type() === "warning") warnings.push(msg.text()); });
const origin = process.env.PREVIEW_ORIGIN || "http://127.0.0.1:3000";
const report = { samples: [], interactions: [], routes: [], errors, warnings };
async function visit(path) {
  const response = await page.goto(origin + path, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200, path);
  await page.evaluate(() => document.fonts.ready);
}
async function measure(context) {
  return page.evaluate(context => {
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const lum = values => values.slice(0,3).map(v => v/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4).reduce((sum,v,i) => sum + v*[.2126,.7152,.0722][i],0);
    const contrast = (a,b) => (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
    function sample(el, property="color") {
      ctx.clearRect(0,0,1,1); ctx.fillStyle="white"; ctx.fillRect(0,0,1,1);
      const chain=[]; for (let node=el;node;node=node.parentElement) chain.unshift(node);
      for (const node of chain) { ctx.fillStyle=getComputedStyle(node).backgroundColor; ctx.fillRect(0,0,1,1); }
      const background=[...ctx.getImageData(0,0,1,1).data];
      ctx.fillStyle=getComputedStyle(el)[property]; ctx.fillRect(0,0,1,1);
      return contrast([...ctx.getImageData(0,0,1,1).data],background);
    }
    const samples=[];
    for (const el of document.querySelectorAll("[data-ui~=badge], [data-ui~=semantic-icon], [data-ui~=confidence]")) {
      if(!el.getClientRects().length)continue;
      const icon=el.matches("svg") ? el : el.querySelector("svg");
      samples.push({context,theme:el.closest("[data-preview-theme]")?.dataset.previewTheme || document.documentElement.className,state:el.dataset.state || el.getAttribute("aria-label"),treatment:el.dataset.treatment,text:el.textContent,ratio:sample(el),iconRatio:icon ? sample(icon) : null,iconSize:icon?.getBoundingClientRect().width,stroke:icon ? getComputedStyle(icon).strokeWidth : null});
    }
    return {samples,overflow:document.documentElement.scrollWidth > innerWidth};
  },context);
}
try {
  await visit("/platform/overview");
  for(const theme of ["light","dark"]) {
    await page.evaluate(theme=>{localStorage.setItem("theme",theme);document.documentElement.className=theme;},theme);
    for(const [path,name] of [["/platform/overview","dashboard"],["/platform/cases?queue=All","cases"],["/platform/cases/FM-1048","investigation"],["/platform/cases/13845102-e81a-479e-87db-2cdb8ff21c1c","conclusion"]]) {
      await visit(path);const audit=await measure(`${name} ${theme}`);report.samples.push(...audit.samples);assert.ok(!audit.overflow,`${path} overflow`);
      await page.screenshot({ path: resolve(output,`${name}-${theme}.png`), fullPage: name==="conclusion" });
      report.routes.push({path,theme,status:200});
      if(name==="cases") {
        await page.getByRole("button",{name:"Quick preview FM-1048",exact:true}).click();await page.locator("[data-ui~=case-preview]").waitFor();
        await page.waitForFunction(() => {
          const dialog = document.querySelector('[data-ui~=case-preview]');
          return dialog && !dialog.hasAttribute("data-starting-style") && getComputedStyle(dialog).opacity === "1";
        });
        report.samples.push(...(await measure(`case preview ${theme}`)).samples);
        await page.screenshot({path:resolve(output,`preview-${theme}.png`)});
        await page.keyboard.press("Escape");await page.locator("[data-ui~=case-preview]").waitFor({state:"hidden"});
        report.interactions.push(`${theme}: anchored case preview and Escape`);
      }
    }
  }
  const failures=report.samples.filter(s=>s.ratio<4.5 || (s.iconRatio!==null && s.iconRatio<3));
  report.summary={samples:report.samples.length,minTextContrast:Math.min(...report.samples.map(s=>s.ratio)),minIconContrast:Math.min(...report.samples.map(s=>s.iconRatio??Infinity)),failures};
  await writeFile(resolve(output,"validation.json"),JSON.stringify(report,null,2));
  assert.deepEqual(failures,[],"Rendered semantic contrast");assert.deepEqual(errors,[],"Browser errors");
  console.log(JSON.stringify({summary:report.summary,routes:report.routes,interactions:report.interactions,warnings},null,2));
} catch (error) {
  await writeFile(resolve(output,"validation-partial.json"), JSON.stringify({...report, failure:String(error)},null,2));
  await page.screenshot({path:resolve(output,"failure.png")});throw error;
} finally { await browser.close(); }
