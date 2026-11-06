import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
async function moduleUrl(path) {
  const source=await readFile(new URL(path,import.meta.url),'utf8');
  return ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;
}
const preview=await moduleUrl('../lib/preview-data.ts');
const previewUrl=`data:text/javascript;base64,${Buffer.from(preview).toString('base64')}`;
const source=(await moduleUrl('../lib/overview-data.ts')).replace('"./preview-data"',JSON.stringify(previewUrl));
const overview=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
test('seven-day chart and impact totals reconcile',()=>{
 const report=overview.impactReports['7d'];
 assert.deepEqual([report.oscar,report.analyst,report.failed,report.closed],[18,36,4,54]);
 assert.deepEqual(overview.impactSummary(report),{share:33,finished:58,estimatedMinutesSaved:360,estimatedHoursSaved:6});
 assert.equal(overview.assumedMinutesPerAutonomousClosure,20);
 assert.equal(overview.impactSummary(report,30).estimatedHoursSaved,9);
});
test('all reporting periods reconcile their daily series and keep failures outside closed cases',()=>{
 for(const report of Object.values(overview.impactReports)) {
  assert.equal(report.closed,report.oscar+report.analyst);
  for(const key of ['oscar','analyst','failed']) assert.equal(report.daily.reduce((s,d)=>s+d[key],0),report[key]);
  assert.ok(report.daily.every(d=>d.closed===d.oscar+d.analyst));
  assert.equal(report.verdicts?.reduce((sum,item)=>sum+item.value,0) ?? report.closed,report.closed);
  assert.ok(!('medianSeconds' in report) && !('previousShare' in report));
 }
});
test('review queue orders urgent cases first and oldest first within priority',()=>{
 const result=overview.attentionOrder([
  {id:'n',status:'Needs you',priority:'Notable',ageMinutes:50},
  {id:'u1',status:'Needs you',priority:'Urgent',ageMinutes:4},
  {id:'closed',status:'Closed',priority:'Urgent',ageMinutes:900},
  {id:'u2',status:'Escalated',priority:'Urgent',ageMinutes:12},
 ]);
 assert.deepEqual(result.map(x=>x.id),['u2','u1','n']);
});
test('priority breakdown matches the open snapshot',()=>{
 assert.equal(overview.openPriorities.reduce((s,x)=>s+x.value,0),overview.operations.needsYou+overview.operations.running);
});
