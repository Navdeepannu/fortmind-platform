import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');

const output=process.env.CASE_SCREENSHOT_DIR || join(tmpdir(),'fortmind-case-investigation');
await mkdir(output,{recursive:true});
const browser = await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE}:{})});
const errors=[];
const mutations=[];
try {
  const page=await browser.newPage({viewport:{width:1440,height:900},permissions:['clipboard-read','clipboard-write']});
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{if(m.type()==='error') errors.push(m.text())});
  page.on('request', request=>{if(!['GET','HEAD'].includes(request.method())) mutations.push(`${request.method()} ${request.url()}`)});
  const base=process.env.CASE_PREVIEW_URL || 'http://localhost:3000/platform/cases/case-detail';
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('heading',{level:1,name:'FortMind smoke: LSASS memory access'}).waitFor();
  assert.equal(await page.locator('[data-slot="sidebar-wrapper"]').count(),1);
  const ids=['conclusion','attack-path','hypotheses','findings','how-oscar-decided','entities','similar-cases','evidence','actions','analyst-notes','timeline'];
  assert.equal(await page.locator('[data-ui~=page-nav] a[href^="#"]').count(),12);
  for (const id of ids) assert.equal(await page.locator(`section#${id}`).count(),1);
  assert.equal(await page.locator('#findings details').count(),5);
  assert.equal(await page.locator('#hypotheses [data-ui~=record]').count(),2);
  assert.equal(await page.locator('#evidence tbody tr').count(),5);
  await page.screenshot({path:join(output,'client-review-initial.png')});
  await page.evaluate(()=>localStorage.setItem('theme','dark'));
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.documentElement.classList.contains('dark'));
  await page.screenshot({path:join(output,'client-review-dark.png')});
  await page.evaluate(()=>localStorage.setItem('theme','light'));
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(()=>!document.documentElement.classList.contains('dark'));
  await page.getByRole('button',{name:'Copy case ID'}).click();
  await page.waitForFunction(()=>/copied/i.test(document.querySelector('[data-ui~=header-id] [role="status"]')?.textContent||''));
  assert.match(await page.locator('[data-ui~=header-id] [role="status"]').innerText(),/copied/i);
  await page.getByRole('button',{name:'More actions'}).click();
  for (const action of ['Escalate case','Teach OSCAR','Rerun investigation']) {
    assert.equal(await page.getByRole('menuitem',{name:action}).getAttribute('data-disabled'),'');
  }
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Confirm verdict'}).click();
  await page.getByRole('dialog',{name:'Confirm OSCAR’s verdict'}).getByRole('button',{name:'Confirm in preview'}).click();
  assert.match(await page.locator('[data-ui~=review-result]').innerText(),/Suspicious/);
  await page.getByRole('button',{name:'Override verdict'}).click();
  const dialog=page.getByRole('dialog',{name:'Override OSCAR’s verdict'});
  await dialog.getByRole('button',{name:'Apply correction in preview'}).click();
  assert.match(await dialog.innerText(),/Choose a different verdict/);
  await dialog.getByLabel('Your verdict').selectOption('Malicious');
  await dialog.getByRole('button',{name:'Apply correction in preview'}).click();
  assert.match(await dialog.innerText(),/Add a rationale/);
  await dialog.locator('#review-rationale').fill('Review test only.');
  await dialog.getByRole('button',{name:'Apply correction in preview'}).click();
  assert.match(await page.locator('[data-ui~=review-result]').innerText(),/Malicious/);
  assert.match(await page.locator('[data-ui~=proposed-verdict]').innerText(),/Suspicious/);
  for (const id of ids) {
    await page.locator(`[data-ui~=page-nav] a[href="#${id}"]`).first().click();
    await page.waitForFunction(id=>document.querySelector('[data-ui~=page-nav] a[aria-current="location"]')?.getAttribute('href')===`#${id}`,id);
    await page.waitForFunction(id=>{
      const section=document.getElementById(id).getBoundingClientRect();
      const nav=document.querySelector('[data-ui~=page-nav]').getBoundingClientRect();
      const atEnd=innerHeight+scrollY>=document.documentElement.scrollHeight-3;
      return section.top>=nav.bottom-1 || atEnd;
    },id);
    assert.equal(new URL(page.url()).hash,`#${id}`);
  }
  const cases=[];
  for (const [name,width,collapsed] of [['desktop',1440,false],['laptop',1280,false],['tablet',900,false],['mobile',390,false],['wide-collapsed',1920,true]]) {
    await page.setViewportSize({width,height:900});
    await page.goto(base,{waitUntil:'networkidle'});
    if (collapsed) await page.getByRole('button',{name:'Toggle sidebar'}).click();
    await page.locator('[data-ui~=page-nav] a[href="#findings"]').first().click();
    await page.waitForFunction(()=>document.querySelector('#findings').getBoundingClientRect().top<=145);
    await page.waitForTimeout(100);
    const check=await page.evaluate(()=>{
      const rect=s=>document.querySelector(s).getBoundingClientRect();
      return {viewport:innerWidth,page:document.documentElement.scrollWidth,scrollY,topbar:rect('[data-ui~=utility-bar]').top,nav:rect('[data-ui~=page-nav]').top,navBottom:rect('[data-ui~=page-nav]').bottom,finding:rect('#findings').top,header:rect('[data-ui~=header]').bottom,active:document.querySelector('[data-ui~=page-nav] a[aria-current="location"]')?.getAttribute('href'),workspace:rect('[data-case-workspace]').width};
    });
    assert.ok(check.page<=check.viewport,`${name} horizontal overflow ${JSON.stringify(check)}`);
    assert.ok(check.scrollY>0,`${name} did not window scroll`);
    assert.ok(check.header<0,`${name} case header did not scroll`);
    assert.ok(Math.abs(check.topbar)<2,`${name} global header not sticky`);
    assert.ok(Math.abs(check.nav-48)<2,`${name} section nav not directly below the top bar`);
    assert.equal(check.active,'#findings',`${name} active section`);
    assert.ok(check.finding>=check.navBottom-1,`${name} anchor hidden`);
    await page.screenshot({path:join(output,`${name}.png`)});
    cases.push({name,...check});
  }
  await page.locator('[data-ui~=page-nav] a[href="#timeline"]').first().click();
  await page.waitForFunction(()=>document.querySelector('[data-ui~=page-nav] a[aria-current="location"]')?.getAttribute('href')==='#timeline');
  assert.equal(await page.locator('[data-ui~=page-nav] a[aria-current="location"]').first().getAttribute('href'),'#timeline');
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(300);
  assert.equal(await page.locator('[data-ui~=page-nav] a[aria-current="location"]').getAttribute('href'),'#conclusion');
  const origin=new URL(base).origin;
  await page.goto(`${origin}/platform/cases/13845102-e81a-479e-87db-2cdb8ff21c1c`,{waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-ui~=page-nav] a[href^="#"]').count(),12);
  await page.getByRole('link',{name:'← Back to Cases'}).click();
  await page.waitForURL(`${origin}/platform/cases`);
  await page.goto(`${origin}/platform/cases/FM-1048`,{waitUntil:'networkidle'});
  await page.getByRole('heading',{level:1,name:'LSASS process accessed by mimikatz.exe'}).waitFor();
  assert.deepEqual(errors,[]);
  assert.deepEqual(mutations,[]);
  console.log(JSON.stringify({cases,errors,mutations,output},null,2));
} finally {await browser.close()}
