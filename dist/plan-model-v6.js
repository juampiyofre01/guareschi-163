import * as THREE from 'three';
import {metricPlan,balconyFor,doorHands,sourcePoint,planWindows} from './metric-plans.js?v=9';
import {furnished,interiorMaterial,door} from './interior-detail.js?v=9';
import {equipment} from './equipment.js?v=9';

export function modelFromPlan(unit,upper,p,registerMaterial){
 const data=metricPlan(unit.type),root=new THREE.Group(),origin=p.point(0,0),end=p.point(1,1),W=p.width,D=p.depth;
 root.name=`Unidad_${unit.id}_${upper?'superior':'principal'}`;root.position.set(origin[0],p.y,origin[1]);root.scale.set(Math.sign(end[0]-origin[0]),1,Math.sign(end[1]-origin[1]));
 const paint=new THREE.MeshStandardMaterial({name:'Pintura_interiores',color:0xe8e5dd,roughness:.82,side:THREE.DoubleSide});registerMaterial(paint);
 const trim=interiorMaterial('Laca_marfil'),metal=interiorMaterial('Grafito'),tile=interiorMaterial('Piedra_gris'),oak=interiorMaterial('Roble_natural'),glass=interiorMaterial('Vidrio');
 const floor=oak.clone();floor.name='Vinilico_simil_madera';if(oak.map){floor.map=oak.map.clone();floor.map.wrapS=floor.map.wrapT=THREE.RepeatWrapping;floor.map.repeat.set(.5,.5);}registerMaterial(floor);
 const audits=[];root.userData.layoutAudit=audits;
 function box(x,y,z,w,h,d,m=paint,role='interior'){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;o.userData.role=role;root.add(o);return o;}
 function prism(poly,y,t,mat,holes=[]){const s=new THREE.Shape(poly.map(([x,z])=>new THREE.Vector2(x,-z)));for(const hole of holes)s.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));const o=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:t,bevelEnabled:false}),mat);o.rotation.x=-Math.PI/2;o.position.y=y;o.receiveShadow=true;o.userData.role='floor';root.add(o);return o;}
 function rawWall(a,b,h=2.65,t=.12,base=0,mat=paint,role='wall'){const [x,z]=a,[xx,zz]=b,len=Math.hypot(xx-x,zz-z);if(len<.012)return;const o=box((x+xx)/2,base+h/2,(z+zz)/2,len,h,t,mat,role);o.rotation.y=-Math.atan2(zz-z,xx-x);if(base===0){const sk=box(o.position.x,.055,o.position.z,len,.11,t+.012,trim,role);sk.rotation.y=o.rotation.y;}return o;}
 function wall(a,b,t=.12,openings=[],role='wall'){const dx=b[0]-a[0],dz=b[1]-a[1],len2=dx*dx+dz*dz;if(len2<1e-8)return;let spans=[];
  for(const d of openings){const c=d.slice(0,2),e=d.slice(2,4),cross=q=>Math.abs((q[0]-a[0])*dz-(q[1]-a[1])*dx);if(cross(c)<.0001&&cross(e)<.0001){const at=q=>((q[0]-a[0])*dx+(q[1]-a[1])*dz)/len2,lo=Math.max(0,Math.min(at(c),at(e))),hi=Math.min(1,Math.max(at(c),at(e)));if(hi>lo)spans.push([lo,hi,d[4]??0,d[5]??2.18]);}}
  spans.sort((a,b)=>a[0]-b[0]);let cur=0;const point=t=>[a[0]+dx*t,a[1]+dz*t];for(const [lo,hi,sill,top] of [...spans,[1,1,0,2.18]]){if(lo>cur)rawWall(point(cur),point(lo),2.65,t,0,paint,role);if(hi>lo){if(sill>0)rawWall(point(lo),point(hi),sill,t,0,paint,role);rawWall(point(lo),point(hi),2.65-top,t,top,paint,role);}cur=Math.max(cur,hi);}
 }
 function window(a,b,sill=.12,top=2.25){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=-Math.atan2(b[1]-a[1],b[0]-a[0]);for(const y of [sill,top]){const o=box((a[0]+b[0])/2,y,(a[1]+b[1])/2,len,.05,.08,metal,'envelope');o.rotation.y=angle;}for(const v of [0,.5,1])box(a[0]+(b[0]-a[0])*v,(sill+top)/2,a[1]+(b[1]-a[1])*v,.045,top-sill,.045,metal,'envelope');const o=box((a[0]+b[0])/2,(sill+top)/2,(a[1]+b[1])/2,len,top-sill,.009,glass,'envelope');o.rotation.y=angle;}
 function item(it){const [x,z]=it.center,[su,sv]=it.span,angle=it.yaw*Math.PI/180,quarter=Math.abs(Math.sin(angle))>.70;const obj=furnished(root,it.kind,x,0,z,quarter?sv:su,quarter?su:sv,angle);obj.name=it.kind+'_'+it.room;obj.userData.role='furniture';if(it.kind==='closet')obj.scale.y=2.65/2.44;audits.push({...it});return obj;}
 function rail(a,b,y=1.05,base=0){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),rot=-Math.atan2(b[1]-a[1],b[0]-a[0]);for(const h of [.12,.52,y]){const o=box((a[0]+b[0])/2,base+h,(a[1]+b[1])/2,len,.03,.03,metal,'rail');o.rotation.y=rot;}for(let i=0,n=Math.ceil(len/.65);i<=n;i++)box(a[0]+(b[0]-a[0])*i/n,base+y/2,a[1]+(b[1]-a[1])*i/n,.03,y,.03,metal,'rail');}
 const stair=data.stair?{x0:1.12,x1:3.78,z0:6.35,z1:8.22}:null;
 const hole=stair?[[stair.x0-.04,stair.z0-.04],[stair.x1+.10,stair.z0-.04],[stair.x1+.10,stair.z1+.04],[stair.x0-.04,stair.z1+.04]]:[];
 root.userData.stairHole=hole;
 function stairs(offset=0){const startIndex=root.children.length;const {x0,x1,z0,z1}=stair,r=(z1-z0)/2,cx=x0+r,cz=(z0+z1)/2,run=x1-cx,rise=2.9/16;
  const step=(x,z,y,w,d)=>box(x,offset+y-.075,z,w,.15,d,trim,'stair');
  for(let i=0;i<6;i++)step(x1-(i+.5)*run/6,z0+r/2,(i+1)*rise,run/6,r-.03);
  for(let i=0;i<4;i++){const poly=[],a=-Math.PI/2-i*Math.PI/4,b=a-Math.PI/4;for(let j=0;j<=8;j++){const t=a+(b-a)*j/8;poly.push([cx+r*Math.cos(t),cz+r*Math.sin(t)]);}for(let j=8;j>=0;j--){const t=a+(b-a)*j/8;poly.push([cx+.065*Math.cos(t),cz+.065*Math.sin(t)]);}prism(poly,offset+(7+i)*rise-.15,.15,trim);}
  for(let i=0;i<6;i++)step(cx+(i+.5)*run/6,z1-r/2,(11+i)*rise,run/6,r-.03);
  const beam=(a,b)=>{const dir=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),o=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,dir.length(),8),metal);o.position.copy(new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());o.userData.role='rail';root.add(o);};
  for(const [zz,start,finish] of [[z0+.04,rise,6*rise],[z1-.04,16*rise,11*rise]]){beam([x1,offset+start+.9,zz],[cx,offset+finish+.9,zz]);for(let j=0;j<=4;j++){const t=j/4,x=x1+(cx-x1)*t,h=start+(finish-start)*t;beam([x,offset+h,zz],[x,offset+h+.9,zz]);}}
  rail([x0+.02,z0],[x0+.02,z1],.9,offset+8*rise);
  root.userData.stair={bounds:[x0,z0,x1,z1],rise:2.9,steps:16,flightWidth:r-.03,tread:run/6,riser:rise,top:offset+2.9,bottom:offset,handrails:true,evidence:'plan location; developed dimensions proposed'};
  root.children.slice(startIndex).forEach(o=>o.userData.stairPart=true);
 }
 const equip=(kind,x,z,yaw=0)=>equipment(root,kind,x,z,yaw*Math.PI/180);
 const rect=(x,z,w,d)=>[[x,z],[x+w,z],[x+w,z+d],[x,z+d]];
 if(!upper){
  prism(data.outline,-.08,.08,floor);
  const apertures=planWindows(unit.type);
  root.userData.planOpenings=apertures;
  for(const w of apertures)window(w.slice(0,2),w.slice(2,4),w[4],w[5]);
  data.outline.forEach((a,i)=>{const b=data.outline[(i+1)%data.outline.length];wall(a,b,.23,[...data.doors,...apertures],'envelope');});
  const passage=unit.upper?[[...sourcePoint(unit.type,455,355),...sourcePoint(unit.type,495,355),0,2.18]]:[];
  for(const w of data.walls)wall(w.slice(0,2),w.slice(2),.12,[...data.doors,...passage]);
  data.doors.forEach((d,i)=>door(root,d.slice(0,2),d.slice(2),0,doorHands[unit.type][i],65));
  for(const [name,[a,b]]of Object.entries(data.rooms))if(/bath|ensuite/i.test(name))prism(rect(Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1])),.001,.008,tile);
  data.items.filter(i=>i.kind!=='kitchen'&&!(unit.type==='C'&&['sofa','table'].includes(i.kind))).forEach(item);
  const mainBath=unit.type==='B'?'bath':unit.type==='C'?'bath':'ensuite',wc=data.items.find(i=>i.kind==='toilet'&&i.room===mainBath),bp={A:[969,742],B:[1024,665],C:[1250,224],D:[578,665],E:[578,665]}[unit.type],bidet=sourcePoint(unit.type,...bp);
  equip('bidet',...bidet,wc.yaw);
  if(unit.type==='A'||unit.upper){const cz=unit.type==='A'?6.13:5.85;item({kind:'kitchen',center:[2.42,cz],span:[2.65,.62],yaw:180,room:'cocina'});equip('fridge',.54,cz,180);equip('bar',1.78,4.7,0);equip('boiler',.40,cz+.3,180);if(unit.type==='A'){item({kind:'laundry',center:[2.15,7.64],span:[1.48,.66],yaw:180,room:'patio'});prism(rect(1.05,6.66,2.9,1.25),.002,.006,tile);}}
  if(unit.type==='B'){item({kind:'kitchen',center:[.43,6.95],span:[.62,2.45],yaw:90,room:'cocina'});equip('fridge',.49,5.22,90);equip('armchair',unit.id==='105'?1.55:1.23,unit.id==='105'?4.12:3.40,unit.id==='105'?135:-45);}
  if(unit.id==='105'){
   // User-requested framed Batman portrait on the living/bedroom partition.
   // Vector mesh artwork keeps the same appearance in the viewer and GLB export.
   const ink=new THREE.MeshStandardMaterial({name:'Cuadro_Batman_negro',color:0x111419,roughness:.85,side:THREE.DoubleSide});
   const paper=new THREE.MeshStandardMaterial({name:'Cuadro_Batman_marfil',color:0xeae8df,roughness:.9,side:THREE.DoubleSide});
   registerMaterial(ink);registerMaterial(paper);
   const cx=3.085-.085,cy=.77,cz=1.85;
   const frame=box(cx,cy,cz,.045,.95,.68,ink,'artwork');frame.name='Cuadro_Batman_105';
   const polygon=(points,mat,depth=0)=>{const s=new THREE.Shape(points.map(([u,v])=>new THREE.Vector2(u*.60,v*.86)));const m=new THREE.Mesh(new THREE.ShapeGeometry(s),mat);m.rotation.y=-Math.PI/2;m.position.set(cx-.027-depth,cy,cz);m.name='Batman_retrato_105';m.userData.role='artwork';root.add(m);};
   // Stylized monochrome cowl, pointed ears, cape and chest silhouette.
   polygon([[-.48,-.43],[-.42,-.20],[-.23,-.09],[-.17,.07],[-.18,.42],[-.07,.23],[.07,.23],[.18,.42],[.17,.07],[.23,-.09],[.42,-.20],[.48,-.43],[.27,-.33],[.18,-.43],[0,-.34],[-.18,-.43],[-.27,-.33]],paper);
   polygon([[-.12,.12],[-.02,.08],[-.04,.04],[-.12,.07]],ink,.002);
   polygon([[.12,.12],[.02,.08],[.04,.04],[.12,.07]],ink,.002);
   polygon([[-.27,-.22],[-.12,-.25],[-.08,-.16],[0,-.22],[.08,-.16],[.12,-.25],[.27,-.22],[.18,-.33],[.09,-.29],[0,-.37],[-.09,-.29],[-.18,-.33]],ink,.002);
   root.userData.customization105={armchair:{center:[1.55,4.12],yaw:135},artwork:'Batman portrait on living partition'};
  }
  if(unit.type==='C'){item({kind:'kitchen',center:[2.15,7.68],span:[2.3,.62],yaw:180,room:'cocina'});equip('fridge',.50,7.58,180);equip('armchair',3.25,.91,45);equip('armchair',3.25,3.19,135);equip('bench',2.17,2.05,0);equip('bar',3.60,5.97,0);}
  equip('ac',2.45,.18,0);
  const bal=balconyFor(unit),a=unit.type==='C'?0:.10,b=a+bal.length,poly=bal.shallow?[[a,0],[b,0],[b,-bal.shallow],[a+bal.length*.68,-bal.shallow],[a+bal.length*.68,-bal.depth],[a,-bal.depth]]:rect(a,-bal.depth,bal.length,bal.depth);
  prism(poly,-.08,.08,tile);for(let i=1;i<poly.length;i++){rail(poly[i],poly[(i+1)%poly.length]);if(Math.abs(poly[i][1]-poly[(i+1)%poly.length][1])<.001&&poly[i][1]<0)rawWall(poly[i],poly[(i+1)%poly.length],.90,.16,0,paint,'envelope');}root.userData.balcony=bal;
  if(stair)stairs();
 }else{
  const split=unit.type==='D'?4.465:5.685,terraceEnd=unit.type==='D'?8.82:8.95,terraceStart=unit.type==='D'?.12:4.90;
  const outline=unit.type==='D'?rect(.08,.10,W-.16,D-.20):[[.08,split],[terraceStart,split],[terraceStart,.10],[W-.08,.10],[W-.08,D-.10],[.08,D-.10]];
  prism(outline,-.20,.20,tile,[hole]);root.userData.upperOutline=outline;
  wall([.08,D-.10],[W-.08,D-.10],.23,[[W-1.4,D-.10,W-.5,D-.10,0,2.18]],'envelope');door(root,[W-1.4,D-.10],[W-.5,D-.10],0,[1,-1]);
  wall([.08,split],[.08,D-.10],.16,[],'envelope');wall([W-.08,split],[W-.08,D-.10],.23,[],'envelope');
  const opening=unit.type==='D'?[3.55,4.45]:[5.02,5.92];wall([.08,split],[W-.08,split],.23,[[opening[0],split,opening[1],split,0,2.18]],'envelope');door(root,[opening[0],split],[opening[1],split],0,[1,1]);
  if(unit.type==='D'){
   const x=1.12,xx=3.39,z=split,zz=6.24;
   rawWall([x,z],[x,zz]);rawWall([x,zz],[xx,zz]);wall([xx,z],[xx,zz],.12,[[xx,4.95,xx,5.75,0,2.18]]);door(root,[xx,4.95],[xx,5.75],0,[1,-1]);root.userData.depositClear=[1.60,2.15];
  }
  item({kind:'laundry',center:[W-1.18,D-.48],span:[1.47,.66],yaw:180,room:'lavadero'});
  equip('bbq',terraceStart+.72,split-.46,0);equip('boiler',W-.32,D-1.05,180);
  item({kind:'table',center:[(terraceStart+terraceEnd)/2,2.20],span:[2.05,1.8],yaw:0,room:'terraza'});
  if(unit.type==='D'){equip('bench',1.52,1.1,0);equip('bench',1.52,2.1,0);}
  rail([terraceStart,.10],[W-.08,.10]);rail([W-.08,.10],[W-.08,split]);if(unit.type==='E')rail([terraceStart,.10],[terraceStart,split]);
  rail(hole[0],hole[3]);rail(hole[0],hole[1]);rail(hole[3],hole[2]);stairs(-2.9);
  const roof=prism(rect(.08,split,W-.16,D-.10-split),2.65,.18,paint);roof.userData.role='roof';
 }
 return root;
}
