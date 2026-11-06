import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadProjectModule } from "./load-project-module.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = resolve(process.env.QUEUE_OUTPUT || "docs/case-queue");
await mkdir(output, { recursive: true });
const origin = process.env.PREVIEW_ORIGIN || "http://127.0.0.1:3007";
const browser = await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_EXECUTABLE} : {})});
const { cases } = loadProjectModule("lib/preview-data.ts");
const { QueueVerdictBadge, QueueStatusIndicator } = loadProjectModule("components/fortmind/case-queue-semantic.tsx");
const render = (Component, item) => renderToStaticMarkup(React.createElement(Component, { item }));
const report = { checks: [], geometry: [], contrast: [], errors: [], warnings: [], failedRequests: [] };
let currentPage;
async function geometry(page) {
  return page.evaluate(() => {
    const result = {};
    for (const selector of ["[data-ui~=sidebar]", "[data-ui~=page-heading]", "[data-ui~=queue-top]", "[data-ui~=filter-row]", "[data-ui~=case-table]", "[data-ui~=case-table] tbody tr"]) {
      const el = document.querySelector(selector), box = el.getBoundingClientRect();
      result[selector] = {x:box.x,y:box.y,width:box.width,height:box.height};
    }
    result.columns = [...document.querySelectorAll("[data-ui~=case-table] thead th")].map(el => ({name:el.textContent.trim(),width:el.getBoundingClientRect().width}));
    return result;
  });
}
async function measure(page, theme, context) {
  return page.evaluate(({theme,context}) => {
    const ctx = document.createElement("canvas").getContext("2d", {willReadFrequently:true});
    function lum(rgb) { return rgb.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0); }
    function ratio(el) {
      ctx.clearRect(0,0,1,1);ctx.fillStyle="white";ctx.fillRect(0,0,1,1);
      const chain=[];for(let node=el;node;node=node.parentElement)chain.unshift(node);
      for(const node of chain){ctx.fillStyle=getComputedStyle(node).backgroundColor;ctx.fillRect(0,0,1,1);}
      const bg=lum([...ctx.getImageData(0,0,1,1).data]);ctx.fillStyle=getComputedStyle(el).color;ctx.fillRect(0,0,1,1);
      const fg=lum([...ctx.getImageData(0,0,1,1).data]);return(Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);
    }
    const samples=[];
    for(const el of document.querySelectorAll('[data-ui~=case-section] [data-ui~=badge], [data-ui~=queue-outcome], [data-ui~=case-section] [data-ui~=tab-icon], [data-ui~=filter-option-icon][data-tone]')) {
      if(!el.getClientRects().length)continue;
      const icon=el.matches('svg')?el:el.querySelector('svg');
      samples.push({theme,context,text:el.textContent.trim(),state:el.dataset.state,treatment:el.dataset.treatment,color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor,ratio:ratio(el),iconRatio:icon?ratio(icon):null,iconSize:icon ? parseFloat(getComputedStyle(icon).width) : null});
    }
    return samples;
  },{theme,context});
}
try {
  for(const theme of ["light","dark"]) {
    const context=await browser.newContext({viewport:{width:1440,height:1050},permissions:["clipboard-read","clipboard-write"]});
    await context.addInitScript(theme=>localStorage.setItem("theme",theme),theme);
    const page=await context.newPage();currentPage=page;
    page.on("pageerror",error=>report.errors.push(error.message));
    page.on("response",response=>{if(response.status()>=400)report.failedRequests.push({status:response.status(),url:response.url()});});
    page.on("console",msg=>{if(msg.type()==="error")report.errors.push(`${msg.location().url || page.url()}: ${msg.text()}`);if(msg.type()==="warning")report.warnings.push(msg.text());});
    const url=`${origin}/platform/cases?queue=All`;
    async function reload() { const response=await page.goto(url,{waitUntil:"networkidle"});assert.equal(response.status(),200);await page.evaluate(()=>document.fonts.ready); }
    await reload();
    const layout=await geometry(page);report.geometry.push({theme,...layout});
    if(process.env.QUEUE_BASELINE) { await writeFile(resolve(output,`baseline-${theme}.json`),JSON.stringify(layout,null,2));await context.close();continue; }
    const baseline=JSON.parse(await readFile(resolve(process.env.QUEUE_BASELINE_DIR || "docs/case-queue",`baseline-${theme}.json`),"utf8"));
    for (const [actual, expected] of Object.values(layout).slice(0, 6).map((box, index) => [box, Object.values(baseline)[index]])) {
      for (const key of ["x", "y", "width", "height"]) assert.ok(Math.abs(actual[key] - expected[key]) <= 3, `${key} remains within 3px of the queue baseline`);
    }
    assert.deepEqual(layout.columns, baseline.columns, "Table column widths stay unchanged");
    const targetIcons = await page.evaluate(() => {
      const urgent = document.querySelector('[data-ui~=col-priority] [data-state="Urgent"] svg');
      const needs = document.querySelector('[data-ui~=col-status] [data-state="Needs You"] svg');
      const escalated = document.querySelector('[data-ui~=col-status] [data-state="Escalated"] svg');
      return { urgent: getComputedStyle(urgent).color, needs: getComputedStyle(needs).color,
        needsShape: needs.dataset.semanticIcon, needsPaths: needs.querySelectorAll("path").length,
        escalatedShape: escalated.dataset.semanticIcon };
    });
    assert.deepEqual(targetIcons, { urgent: theme === "light" ? "rgb(190, 18, 60)" : "rgb(251, 113, 133)",
      needs: theme === "light" ? "rgb(128, 91, 8)" : "rgb(242, 207, 112)",
      needsShape: "hand-alert", needsPaths: 7, escalatedShape: "arrow-up-from-line" });
    report.checks.push(`${theme}: requested hand/alert and escalation icons; status badges use semantic foreground ink`);
    const fallbackInk = await page.evaluate(() => {
      const root = document.documentElement;
      root.style.setProperty("--queue-urgent-icon", "initial");
      root.style.setProperty("--queue-needs-you-icon", "initial");
      const colors = [
        getComputedStyle(document.querySelector('[data-ui~=col-priority] [data-state="Urgent"] svg')).color,
        getComputedStyle(document.querySelector('[data-ui~=col-status] [data-state="Needs You"] svg')).color,
        getComputedStyle(document.querySelector('[data-ui~=tab-icon][data-state="Needs You"]')).color,
      ];
      root.style.removeProperty("--queue-urgent-icon");
      root.style.removeProperty("--queue-needs-you-icon");
      return colors;
    });
    const fallbackDanger = theme === "light" ? "rgb(190, 18, 60)" : "rgb(251, 113, 133)";
    const fallbackWarning = theme === "light" ? "rgb(128, 91, 8)" : "rgb(242, 207, 112)";
    assert.deepEqual(fallbackInk, [fallbackDanger, fallbackWarning, fallbackWarning]);
    report.checks.push(`${theme}: missing queue aliases retain semantic red/amber instead of inheriting gray`);
    report.contrast.push(...await measure(page,theme,"all cases"));
    const statusBadges = await page.locator('[data-ui~=col-status] [data-ui~=badge]').evaluateAll(elements => elements.map(el => ({
      treatment: el.dataset.treatment,
      background: getComputedStyle(el).backgroundColor,
      foreground: getComputedStyle(el).color,
      icon: getComputedStyle(el.querySelector('svg')).color,
    })));
    assert.ok(statusBadges.length > 0);
    assert.ok(statusBadges.every(badge => badge.treatment === "badge" && badge.background !== "rgba(0, 0, 0, 0)" && badge.icon === badge.foreground));
    const escalationColors = await page.locator('[data-ui~=col-status] [data-state="Escalated"]').evaluate(el => ({foreground:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));
    const needsColors = await page.locator('[data-ui~=col-status] [data-state="Needs You"]').first().evaluate(el => ({foreground:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));
    assert.notEqual(escalationColors.foreground,needsColors.foreground);
    assert.notEqual(escalationColors.background,needsColors.background);
    report.checks.push(`${theme}: every queue status has a subtle tinted background with coordinated icon and text`);
    report.checks.push(`${theme}: Escalated violet and Needs You amber have distinct foregrounds and backgrounds`);
    assert.equal(await page.locator('[data-ui~=case-table] thead th').count(),8);
    await page.screenshot({caret:"initial",path:resolve(output,`queue-${theme}.png`)});
    const priority=page.getByRole("button",{name:/Filter by priority:/});
    await priority.click();
    const notable=page.getByRole("menuitemradio",{name:"Notable",exact:true});
    const optionIcon=await notable.locator('[data-ui~=filter-option-icon]').evaluate(el=>({color:getComputedStyle(el).color,shape:el.className.baseVal}));
    const rowIcon=await page.locator('[data-ui~=col-priority] [data-state="Notable"] svg').first().evaluate(el=>({color:getComputedStyle(el).color,shape:el.className.baseVal}));
    assert.equal(optionIcon.color,rowIcon.color);assert.match(optionIcon.shape,/chevron-up/);
    report.contrast.push(...await measure(page,theme,"priority filter"));
    await notable.click();assert.equal(await priority.getAttribute('data-filter-active'),'true');
    await priority.click();assert.equal(await page.getByRole('menuitemradio',{name:'Notable',exact:true}).getAttribute('aria-checked'),'true');
    await page.locator('[data-ui~=filter-menu]').evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{}))));
    await page.screenshot({caret:"initial",path:resolve(output,`filter-${theme}.png`)});
    await page.keyboard.press('Escape');await page.getByRole('button',{name:'Clear filters',exact:true}).click();
    await page.getByRole('button',{name:/Filter by verdict:/}).click();
    const suspicious=page.getByRole('menuitemradio',{name:'Suspicious',exact:true});
    const filterVerdictColor=await suspicious.locator('[data-ui~=filter-option-icon]').evaluate(el=>getComputedStyle(el).color);
    assert.equal(filterVerdictColor,await page.locator('[data-ui~=col-verdict] [data-state="Suspicious"] svg').first().evaluate(el=>getComputedStyle(el).color));
    await page.keyboard.press('Escape');
    report.checks.push(`${theme}: priority and verdict filters share row icon colors; active and selected states persist`);
    await page.getByRole('tab',{name:'Closed 4',exact:true}).click();
    assert.equal(await page.locator('[data-ui~=col-status] [data-state="Closed by OSCAR"]').count(),2);
    assert.equal(await page.locator('[data-ui~=col-status] [data-state="Closed"]').count(),2);
    assert.equal(await page.locator('[data-ui~=col-status] [data-state="Closed by OSCAR"] [data-semantic-icon="sparkles"]').count(),2);
    const tabGreen=await page.getByRole('tab',{name:'Closed 4',exact:true}).locator('svg').evaluate(el=>getComputedStyle(el).color);
    assert.equal(tabGreen,theme === "light" ? "rgb(22, 131, 74)" : "rgb(74, 222, 128)");
    assert.equal(await page.locator('[data-ui~=col-status] [data-state="Closed"] svg').first().evaluate(el=>getComputedStyle(el).color),theme === "light" ? "rgb(22, 101, 52)" : "rgb(134, 239, 172)");
    assert.equal(await page.getByRole('tab',{name:'Closed 4',exact:true}).evaluate(el=>getComputedStyle(el,'::after').backgroundColor),await page.locator("[data-ui~=queue-top]").evaluate(el=>getComputedStyle(el).color));
    report.contrast.push(...await measure(page,theme,"closed cases"));
    await page.screenshot({caret:"initial",path:resolve(output,`closed-${theme}.png`)});
    await page.getByRole('tab',{name:'Running 1',exact:true}).click();
    assert.equal(await page.getByRole('tab',{name:'Running 1',exact:true}).locator('svg').evaluate(el=>getComputedStyle(el).animationName),'none');
    assert.equal(await page.locator('[data-ui~=col-status] [data-ui~=queue-status] svg').evaluate(el=>getComputedStyle(el).animationName),'none');
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.locator('[data-ui~=col-status] [data-ui~=queue-status] svg').evaluate(el=>getComputedStyle(el).animationName),'none');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.getByRole('tab',{name:'All 12',exact:true}).click();
    // These explicit test props exercise optional source fields without adding values to product fixtures.
    for(const [verdict,score] of [['Malicious',98],['Suspicious',90],['Benign',95],['Inconclusive',undefined]]) {
      const item={...cases[0],verdict,verdictConfidence:score};
      await page.locator('[data-ui~=col-verdict]').nth(1).evaluate((cell,html)=>cell.innerHTML=html,render(QueueVerdictBadge,item));
      const fits=await page.locator('[data-ui~=col-verdict]').nth(1).evaluate(cell=>{const badge=cell.querySelector('[data-ui~=badge]');return badge.getBoundingClientRect().right<=cell.getBoundingClientRect().right;});
      assert.ok(fits,`${verdict} score fits its existing column`);
      assert.equal(await page.locator('[data-ui~=case-table] tbody tr').first().evaluate(el=>el.getBoundingClientRect().height),62,"Scored rows retain compact height");
      report.contrast.push(...await measure(page,theme,`supplied ${verdict} score`));
    }
    for(const item of [{...cases[0],status:'Running',investigationPhase:'Collect'},{...cases[0],status:'Failed',investigationPhase:'Report',outcomeDescription:'Internal error'},{...cases[0],status:'Closed',outcomeDescription:'Closed as noise'}]) {
      await page.locator('[data-ui~=col-status]').nth(1).evaluate((cell,html)=>cell.innerHTML=html,render(QueueStatusIndicator,item));
      const fits=await page.locator('[data-ui~=col-status]').nth(1).evaluate(cell=>cell.scrollWidth<=cell.clientWidth);
      assert.ok(fits,`${item.status} and phase fit the existing cell`);
      assert.equal(await page.locator('[data-ui~=case-table] tbody tr').first().evaluate(el=>el.getBoundingClientRect().height),62,"Status badges retain compact row height");
      report.contrast.push(...await measure(page,theme,`supplied ${item.status} metadata`));
    }
    report.checks.push(`${theme}: explicit score, phase and outcome props render without changing columns or fixture data; reduced motion works`);
    await reload();
    const priorityStyles=await page.locator('[data-ui~=col-priority] [data-ui~=badge]').first().evaluate(el=>({bg:getComputedStyle(el).backgroundColor,border:getComputedStyle(el).borderWidth,radius:getComputedStyle(el).borderRadius}));
    assert.deepEqual(priorityStyles,{bg:'rgba(0, 0, 0, 0)',border:'0px',radius:'0px'});
    await page.setViewportSize({width:1280,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await context.close();
  }
  if(!process.env.QUEUE_BASELINE) {
    const text=report.contrast.filter(sample=>sample.text),icons=report.contrast.filter(sample=>sample.iconRatio!==null);
    report.summary={samples:report.contrast.length,minTextContrast:Math.min(...text.map(sample=>sample.ratio)),minIconContrast:Math.min(...icons.map(sample=>sample.iconRatio))};
    assert.ok(text.every(sample=>sample.ratio>=4.5),JSON.stringify(text.filter(sample=>sample.ratio<4.5)));
    assert.ok(icons.every(sample=>sample.iconRatio>=3),JSON.stringify(icons.filter(sample=>sample.iconRatio<3)));
    assert.ok(icons.every(sample=>sample.iconSize===16));
    assert.deepEqual(report.errors,[]);assert.deepEqual(report.warnings,[]);
    await writeFile(resolve(output,'validation.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify({summary:report.summary,checks:report.checks},null,2));
  }
} catch(error) {
  await writeFile(resolve(output,'validation-partial.json'),JSON.stringify({...report,failure:String(error)},null,2));
  if(currentPage&&!currentPage.isClosed())await currentPage.screenshot({path:resolve(output,'failure.png')});throw error;
} finally { await browser.close(); }
