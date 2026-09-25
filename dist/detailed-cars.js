import * as THREE from 'three';
let template;
export function configureCars(scene){template=scene;}
export const parkingSpots=[[-6.40,-22.350,Math.PI/2],[6.40,-22.350,-Math.PI/2],[-6.40,-19.415,Math.PI/2],[6.40,-19.415,-Math.PI/2],[-6.40,-28.360,Math.PI/2]];
export function parkedCars(parent,register){
 // Offline Blender assembly appends the original textured car asset separately.
 if(!template)return;
 const colors=[0xc1c5c7,0x223b4d,0x642b2c,0xe2e1db,0x343b3f];
 for(let i=0;i<parkingSpots.length;i++){
  const [x,z,yaw]=parkingSpots[i],g=template.clone(true),mats=new Map();g.name='Automovil_detallado_'+(i+1);g.position.set(x,-.12,z);g.rotation.y=yaw;
  g.traverse(o=>{if(!o.isMesh)return;const key=o.material.uuid;let m=mats.get(key);if(!m){m=o.material.clone();if(m.name.startsWith('Paint 1'))m.color.setHex(colors[i]);m.clipShadows=true;register(m);mats.set(key,m);}o.material=m;o.castShadow=!m.transparent;o.receiveShadow=true;});parent.add(g);
 }
}
