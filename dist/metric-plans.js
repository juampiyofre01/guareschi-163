// Metric anchors: PDF pp10–14, clear room dimensions + wall half-thicknesses.
// Interpolation between anchors is interpretative, not an executive survey.
import {layouts} from './plan-layouts.js?v=8';
const lerp=(v,knots)=>{let i=1;while(i<knots.length-1&&v>knots[i][0])i++;const [a,x]=knots[i-1],[b,y]=knots[i];return x+(v-a)/(b-a)*(y-x);};
const spec={
 A:{bounds:[600,75,1365,785],right:true,w:9.01,d:9.64,u:[[75,0],[450,4.865],[510,5.585],[565,6.285],[650,7.435],[785,9.01]],v:[[600,9.64],[720,8.08],[855,6.49],[865,6.365],[880,6.215],[950,5.245],[1105,3.275],[1365,0]]},
 B:{bounds:[620,125,1490,705],w:6.51,d:9.825,u:[[125,0],[355,2.785],[400,3.085],[465,3.87],[555,4.835],[560,4.89],[705,6.51]],v:[[620,0],[910,3.275],[1035,4.68],[1180,6.45],[1350,8.19],[1490,9.825]]},
 C:{bounds:[640,190,1470,674],w:5,d:8.07,u:[[190,0],[430,2.395],[674,5]],v:[[640,0],[1040,3.975],[1290,6.345],[1470,8.07]]},
 D:{bounds:[290,140,885,695],right:true,w:9.01,d:9.64,u:[[140,0],[207,1.02],[218,1.19],[347,3.74],[355,3.9],[367,4.08],[423,4.72],[433,4.865],[478,5.585],[523,6.285],[585,7.435],[695,9.01]],v:[[290,9.64],[385,8.335],[495,6.215],[560,5.245],[680,3.275],[885,0]]}
};spec.E=spec.D;
export const metricSpecs=spec;
export function sourcePoint(type,x,y){const s=spec[type];return [lerp(y,s.u),lerp(x,s.v)];}
export function metricPoint(type,[u,v]){const s=spec[type],[l,t,r,b]=s.bounds;return [lerp(t+u*(b-t),s.u),lerp(s.right?r-v*(r-l):l+v*(r-l),s.v)];}
export function metricPlan(type){const s=spec[type],d=layouts[type],pt=p=>metricPoint(type,p),seg=a=>[...pt(a.slice(0,2)),...pt(a.slice(2))];
 return {width:s.w,depth:s.d,outline:d.outline.map(pt),walls:d.walls.map(seg),doors:d.doors.map(seg),items:d.items.map(i=>{const lo=pt(i.center.map((x,k)=>x-i.span[k]/2)),hi=pt(i.center.map((x,k)=>x+i.span[k]/2));return {...i,center:pt(i.center),span:lo.map((x,k)=>Math.abs(hi[k]-x))};}),rooms:Object.fromEntries(Object.entries(d.rooms).map(([k,v])=>[k,v.map(pt)])),stair:d.stair?d.stair.map(pt):null};
}
export function balconyFor(unit){if(unit.type==='B')return {length:2.9,depth:1.5};if(unit.type==='C')return {length:5,depth:1.2};return {length:unit.type==='A'&&unit.floor===1?8.4:5.55,depth:1.5,shallow:1.2};}
// Hinge endpoint and swing side are explicitly assigned from the plan arcs.
export const doorHands={A:[[1,1],[0,1],[1,-1],[0,-1],[1,-1],[0,1]],B:[[1,1],[0,-1],[1,-1],[0,1]],C:[[0,1],[1,1]],D:[[0,1],[1,-1],[0,-1],[1,-1],[0,1]],E:[[0,1],[1,-1],[0,-1],[1,-1],[0,1]]};
doorHands.A.push([1,1]);
// Only openings drawn on the front or courtyard elevations. No side/party-wall windows.
const openingPixels={
 A:[[1365,100,1365,241,.12,2.25],[1365,300,1365,442,.12,2.25],[1365,570,1365,690,.85,2.15],[600,520,600,551,1.35,2.15],[600,580,600,638,.85,2.15]],
 B:[[620,166,620,325,.12,2.25],[620,473,620,607,.85,2.15],[1490,415,1490,550,.85,2.15]],
 C:[[640,220,640,390,.12,2.25],[640,470,640,655,.12,2.25],[1470,320,1470,470,1.10,2.15]],
 D:[[885,165,885,273,.12,2.25],[885,318,885,425,.12,2.25],[885,532,885,617,.85,2.15],[290,488,290,512,1.35,2.15],[290,535,290,580,.85,2.15]]
};openingPixels.E=openingPixels.D;
export function planWindows(type){return openingPixels[type].map(([x,y,xx,yy,sill,top])=>[...sourcePoint(type,x,y),...sourcePoint(type,xx,yy),sill,top]);}
