import assert from 'node:assert/strict';
import {metricPlan,planWindows,sourcePoint} from '../dist/metric-plans.js?v=8';
import {units,placement} from '../dist/units.js?v=8';
const inside=(a,b,p)=>Math.abs((p[0]-a[0])*(b[1]-a[1])-(p[1]-a[1])*(b[0]-a[0]))<1e-6&&p.every((v,i)=>v>=Math.min(a[i],b[i])-1e-6&&v<=Math.max(a[i],b[i])+1e-6);
let checks=0;
for(const u of units){
 const d=metricPlan(u.type),edges=d.outline.map((a,i)=>[...a,...d.outline[(i+1)%d.outline.length]]),all=[...edges,...d.walls];
 for(const door of d.doors){assert(all.some(w=>inside(w.slice(0,2),w.slice(2),door.slice(0,2))&&inside(w.slice(0,2),w.slice(2),door.slice(2))),`${u.id}: door without host wall ${door}`);checks++;}
 for(const w of planWindows(u.type)){
  assert(edges.some(e=>inside(e.slice(0,2),e.slice(2),w.slice(0,2))&&inside(e.slice(0,2),e.slice(2),w.slice(2,4))),`${u.id}: opening outside perimeter`);
  assert(Math.abs(w[0]-w[2])>1e-6,`${u.id}: side window on party wall`);checks+=2;
 }
 if(u.type==='B'){
  const a=sourcePoint('B',1350,355),b=sourcePoint('B',1350,465);
  assert(d.walls.some(w=>inside(w.slice(0,2),w.slice(2),a)&&inside(w.slice(0,2),w.slice(2),b)),`${u.id}: missing bedroom return`);checks++;
 }
 const p=placement(u);assert(Number.isFinite(p.y)&&d.outline.every(q=>q.every(Number.isFinite)));checks++;
}
console.log(JSON.stringify({units:units.length,checks,result:'PASS',scope:'Door hosts, window perimeter/party walls, B bedroom wall, finite placement'}));
