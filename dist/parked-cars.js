import * as THREE from 'three';
// Generic parked vehicles, in metres; decorative context, not project equipment.
export function parkedCars(parent,register){
 const material=(name,color,roughness,metalness=0)=>{const m=new THREE.MeshStandardMaterial({name,color,roughness,metalness});register(m);return m;};
 const rubber=material('Auto_neumatico',0x171a1c,.93),alloy=material('Auto_llanta',0x929a9d,.27,.8),glass=material('Auto_cristal',0x20313d,.14,.4),lamp=material('Auto_optica',0xe0e8e8,.2),tail=material('Auto_faro_rojo',0x861c20,.25);
 const colors=[0xb3b8b7,0x213e52,0x70312f,0xe4e1d8,0x444948];
 const spots=[[-6.40,-22.350,Math.PI/2],[6.40,-22.350,-Math.PI/2],[-6.40,-19.415,Math.PI/2],[6.40,-19.415,-Math.PI/2],[-6.40,-28.360,Math.PI/2]];
 for(let i=0;i<spots.length;i++){
  const [x,z,yaw]=spots[i],g=new THREE.Group();g.name='Auto_cochera_'+(i+1);g.position.set(x,-.10,z);g.rotation.y=yaw;g.userData.equipment='car';g.userData.footprint=[4.30,1.84];parent.add(g);
  const paint=material('Auto_pintura_'+i,colors[i],.31,.5);
  function mesh(geom,m){const o=new THREE.Mesh(geom,m);o.castShadow=o.receiveShadow=true;g.add(o);return o;}
  function box(x,y,z,w,h,d,m){const o=mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);return o;}
  function hull(stations,m){const points=[],indices=[];for(const [z,w,low,high,topW=w]of stations)points.push(-w,low,z,w,low,z,topW,high,z,-topW,high,z);for(let s=0;s<stations.length-1;s++)for(let k=0;k<4;k++){const a=s*4+k,b=s*4+(k+1)%4,c=b+4,d=a+4;indices.push(a,b,d,b,c,d);}indices.push(0,3,1,1,3,2);const n=(stations.length-1)*4;indices.push(n,n+1,n+3,n+1,n+2,n+3);const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geom.setIndex(indices);geom.computeVertexNormals();return mesh(geom,m);}
  hull([[-2.15,.74,.39,.68],[-1.75,.86,.32,.88],[-.90,.87,.32,.96],[.85,.87,.32,.93],[1.72,.84,.35,.80],[2.15,.70,.43,.68]],paint);
  hull([[-1.27,.76,.88,.92,.73],[-.65,.75,.91,1.43,.64],[.58,.75,.91,1.43,.64],[1.23,.75,.88,.93,.73]],glass);
  box(0,1.45,-.02,1.30,.055,1.22,paint);
  for(const side of [-1,1]){box(side*.748,1.16,.02,.045,.49,.10,paint);box(side*.78,.88,.05,.04,.07,2.4,paint);box(side*.92,1.0,.91,.20,.12,.23,paint);for(const zz of [-.55,.55])box(side*.877,.80,zz,.018,.032,.15,alloy);}
  for(const xx of [-.82,.82])for(const zz of [-1.36,1.36]){const o=mesh(new THREE.CylinderGeometry(.31,.31,.19,20),rubber);o.rotation.z=Math.PI/2;o.position.set(xx,.31,zz);const rim=mesh(new THREE.CylinderGeometry(.19,.19,.195,16),alloy);rim.rotation.z=Math.PI/2;rim.position.copy(o.position);}
  for(const side of [-1,1]){box(side*.49,.65,2.10,.34,.14,.045,lamp);box(side*.51,.66,-2.11,.31,.13,.045,tail);}
  box(0,.48,2.12,.75,.14,.05,rubber);box(0,.57,-2.145,.36,.10,.02,lamp);
 }
}
