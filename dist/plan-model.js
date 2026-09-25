import * as THREE from 'three';
import {layouts} from './plan-layouts.js';
import {furnished,interiorMaterial,door} from './interior-detail.js';

// Plan axes: +x is down the source drawing; +z is away from the facade.
// A single mirrored parent transforms walls, furniture AND their orientations.
export function modelFromPlan(unit,upper,p,registerMaterial){
 const data=layouts[unit.type],root=new THREE.Group(),origin=p.point(0,0),end=p.point(1,1);
 root.position.set(origin[0],p.y,origin[1]);root.scale.set(Math.sign(end[0]-origin[0]),1,Math.sign(end[1]-origin[1]));
 const pt=([u,v])=>[u*p.width,v*p.depth],paint=new THREE.MeshStandardMaterial({color:0xe8e5dd,roughness:.82,side:THREE.DoubleSide,clipShadows:true});registerMaterial(paint);
 const trim=interiorMaterial('Laca_marfil'),metal=interiorMaterial('Grafito'),tile=interiorMaterial('Piedra_gris'),oak=interiorMaterial('Roble_natural');
 const floor=oak.clone();floor.map=oak.map.clone();floor.map.wrapS=floor.map.wrapT=THREE.RepeatWrapping;floor.map.repeat.set(.5,.5);floor.map.needsUpdate=true;registerMaterial(floor);
 const audits=[];root.userData.layoutAudit=audits;
 function box(x,y,z,w,h,d,m=paint){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;root.add(o);return o;}
 function prism(poly,y,thickness,mat,holes=[]){const s=new THREE.Shape(poly.map(q=>{const [x,z]=pt(q);return new THREE.Vector2(x,-z);}));for(const hole of holes){const h=new THREE.Path(hole.map(q=>{const [x,z]=pt(q);return new THREE.Vector2(x,-z);}));s.holes.push(h);}const o=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:thickness,bevelEnabled:false}),mat);o.rotation.x=-Math.PI/2;o.position.y=y;o.receiveShadow=true;root.add(o);return o;}
 function rawWall(a,b,h=2.65,mat=paint){const [x,z]=pt(a),[xx,zz]=pt(b),len=Math.hypot(xx-x,zz-z);if(len<.015)return;const o=box((x+xx)/2,h/2,(z+zz)/2,len,h,.12,mat);o.rotation.y=-Math.atan2(zz-z,xx-x);if(mat===paint){const sk=box(o.position.x,.135,o.position.z,len,.105,.15,trim);sk.rotation.y=o.rotation.y;}}
 function wall(a,b,doors=data.doors){const dx=b[0]-a[0],dz=b[1]-a[1],len2=dx*dx+dz*dz,intervals=[];
  for(const d of doors){const c=d.slice(0,2),e=d.slice(2),cross=q=>Math.abs((q[0]-a[0])*dz-(q[1]-a[1])*dx);if(cross(c)<.0001&&cross(e)<.0001){const t=q=>((q[0]-a[0])*dx+(q[1]-a[1])*dz)/len2;const lo=Math.max(0,Math.min(t(c),t(e))),hi=Math.min(1,Math.max(t(c),t(e)));if(hi>lo)intervals.push([lo,hi]);}}
  intervals.sort((a,b)=>a[0]-b[0]);let cursor=0;for(const [lo,hi]of [...intervals,[1,1]]){if(lo>cursor)rawWall([a[0]+dx*cursor,a[1]+dz*cursor],[a[0]+dx*lo,a[1]+dz*lo]);cursor=Math.max(cursor,hi);}
 }
 function item(it){const [x,z]=pt(it.center),[su,sv]=[it.span[0]*p.width,it.span[1]*p.depth],angle=it.yaw*Math.PI/180,quarter=Math.abs(Math.sin(angle))>.70;
  const obj=furnished(root,it.kind,x,.085,z,quarter?sv:su,quarter?su:sv,angle);
  if(it.kind==='coffee')obj.traverse(o=>{if(o.isMesh&&o.material.name==='Alfombra_arena')o.visible=false;});
  audits.push({kind:it.kind,center:it.center,span:it.span,yaw:it.yaw,room:it.room});
 }
 function rail(a,b,y=.95){const aa=pt(a),bb=pt(b),len=Math.hypot(bb[0]-aa[0],bb[1]-aa[1]),rot=-Math.atan2(bb[1]-aa[1],bb[0]-aa[0]);for(const h of [.15,.50,y]){const o=box((aa[0]+bb[0])/2,h,(aa[1]+bb[1])/2,len,.03,.03,metal);o.rotation.y=rot;}for(let i=0,n=Math.ceil(len/.8);i<=n;i++)box(aa[0]+(bb[0]-aa[0])*i/n,y/2,aa[1]+(bb[1]-aa[1])*i/n,.03,y,.03,metal);}
 function stairs(offset=0){const a=pt(data.stair[0]),b=pt(data.stair[1]),x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),z0=Math.min(a[1],b[1]),z1=Math.max(a[1],b[1]),r=(z1-z0)/2,cx=x0+r,cz=(z0+z1)/2,run=x1-cx,rise=2.9/16;
  const step=(u,z,y,w,d)=>box(u,offset+y-.075,z,w,.15,d,trim);
  for(let i=0;i<6;i++)step(x1-(i+.5)*run/6,z0+r/2,(i+1)*rise,run/6+.006,r-.025);
  for(let i=0;i<4;i++){const poly=[],start=-Math.PI/2-i*Math.PI/4,finish=start-Math.PI/4;for(let j=0;j<=6;j++){const t=start+(finish-start)*j/6;poly.push([(cx+r*Math.cos(t))/p.width,(cz+r*Math.sin(t))/p.depth]);}for(let j=6;j>=0;j--){const t=start+(finish-start)*j/6;poly.push([(cx+.045*Math.cos(t))/p.width,(cz+.045*Math.sin(t))/p.depth]);}prism(poly,offset+(7+i)*rise-.15,.15,trim);}
  for(let i=0;i<6;i++)step(cx+(i+.5)*run/6,z1-r/2,(11+i)*rise,run/6+.006,r-.025);
  // Central support and handrails stay inside the traced stair enclosure.
  box((cx+x1)/2,offset+1.45,cz,run,2.9,.055,paint);
  box(x1+.18,offset+2.825,z1-r/2,.36,.15,r,trim);
  root.userData.stair={bounds:[x0,z0,x1,z1],rise:2.9,steps:16,turn:'U',upperHole:upper};
 }
 if(!upper){
  prism(data.outline,0,.08,floor);
  data.outline.forEach((a,i)=>{const b=data.outline[(i+1)%data.outline.length];if(Math.abs(a[1])<.001&&Math.abs(b[1])<.001)return;wall(a,b);});
  for(const w of data.walls)wall(w.slice(0,2),w.slice(2));
  for(const d of data.doors)door(root,pt(d.slice(0,2)),pt(d.slice(2)),.08);
  for(const [name,corners] of Object.entries(data.rooms))if(/bath|ensuite/i.test(name)){const [a,b]=corners;prism([[a[0],a[1]],[a[0],b[1]],[b[0],b[1]],[b[0],a[1]]],.014,.08,tile);}
  data.items.forEach(item);
  const max=unit.type==='B'?.46:unit.upper?.64:.98;
  prism([[.02,0],[max,0],[max,-.14],[.02,-.14]],0,.08,tile);rail([.02,-.14],[max,-.14]);
  for(const [lo,hi]of [[.03,Math.min(max,.48)],[.70,.96]]){if(unit.type==='B'&&lo>.5)continue;const x0=lo*p.width,x1=hi*p.width;for(const y of [.12,2.22])box((x0+x1)/2,y,0,x1-x0,.045,.07,metal);for(const x of [x0,(x0+x1)/2,x1])box(x,1.17,0,.035,2.10,.07,metal);box((x0+x1)/2,1.17,0,x1-x0,2.04,.008,interiorMaterial('Vidrio'));}
  if(data.stair)stairs();
 }else{
  const a=data.stair[0],b=data.stair[1],umin=Math.min(a[0],b[0]),umax=Math.max(a[0],b[0]),vmin=Math.min(a[1],b[1]),vmax=Math.max(a[1],b[1]);
  const hole=[[umin,vmin],[umax,vmin],[umax,vmax],[umin,vmax]];
  const outline=unit.type==='E'?[[.03,.66],[.44,.66],[.44,.02],[.98,.02],[.98,.98],[.03,.98]]:[[.03,.02],[.98,.02],[.98,.98],[.03,.98]];
  prism(outline,0,.08,tile,[hole]);
  const boundary=unit.type==='E'?.66:.48;
  rawWall([.03,.98],[.98,.98]);rawWall([.98,boundary],[.98,.98]);rawWall([.03,boundary],[.03,.98]);rawWall([.03,boundary],[.43,boundary]);rawWall([.55,boundary],[.98,boundary]);door(root,pt([.43,boundary]),pt([.55,boundary]),.08);
  // Retain only covered floor outside the real stair opening.
  prism([[.03,boundary],[.98,boundary],[.98,.98],[.03,.98]],.012,.08,floor,[hole]);
  item({kind:'laundry',center:[.84,.91],span:[.20,.08],yaw:180,room:'laundry'});
  item({kind:'table',center:[unit.type==='E'?.73:.48,.24],span:[.25,.25],yaw:0,room:'terrace'});
  rail([unit.type==='E'?.44:.03,.02],[.98,.02]);rail([.98,.02],[.98,boundary]);rail([umin,vmin],[umax,vmin]);rail([umin,vmax],[umax,vmax]);stairs(-2.9);
 }
 return root;
}
