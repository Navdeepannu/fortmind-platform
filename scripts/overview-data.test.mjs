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

test('impact trend preserves grouped closure totals and cumulative time',()=>{
 const report=overview.impactReports['7d'];
 const buckets=overview.impactTrend(report,20);
 assert.equal(buckets.length,7);
 assert.deepEqual(buckets[0],{
   label:'Oct 28', axisLabel:'Oct 28', oscar:2, analyst:4,
   failed:0, closed:6, hoursAdded:0.67, cumulativeHours:0.67,
 });
 assert.equal(buckets.at(-1).cumulativeHours,6);
 assert.equal(buckets.reduce((sum,row)=>sum+row.oscar,0),report.oscar);
 assert.equal(buckets.reduce((sum,row)=>sum+row.analyst,0),report.analyst);
 assert.equal(overview.impactTrend(report,30).at(-1).cumulativeHours,9);
});
test('30 and 90 day trends group data without inventing additional closures',()=>{
 for (const name of ['30d','90d']) {
  const report=overview.impactReports[name];
  const rows=overview.impactTrend(report,20);
  assert.equal(rows.length,Math.ceil(report.daily.length/7));
  assert.equal(rows.reduce((sum,row)=>sum+row.oscar,0),report.oscar);
  assert.equal(rows.reduce((sum,row)=>sum+row.analyst,0),report.analyst);
  assert.equal(rows.reduce((sum,row)=>sum+row.failed,0),report.failed);
  assert.equal(rows.at(-1).cumulativeHours,overview.impactSummary(report).estimatedHoursSaved);
 }
});
