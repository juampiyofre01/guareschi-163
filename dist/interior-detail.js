import * as THREE from 'three';
let library;const materials=new Set();
export function configureDetails(scene){library=scene;scene.traverse(o=>{if(o.isMesh){o.material.side=THREE.DoubleSide;o.material.clipShadows=true;materials.add(o.material);}});return [...materials];}
export function interiorMaterial(name){return [...materials].find(m=>m.name===name);}
export function furnished(group,kind,x,y,z,width,depth,rotation=0){
 const template=library.getObjectByName(kind);if(!template)throw Error(`Missing interior asset: ${kind}`);
 const content=template.clone(true);if(kind==='coffee'){const remove=[];content.traverse(n=>{if(n.isMesh&&n.material.name==='Alfombra_arena')remove.push(n);});remove.forEach(n=>n.removeFromParent());}const bounds=new THREE.Box3().setFromObject(content),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),o=new THREE.Group();content.position.sub(new THREE.Vector3(kind==='door'?0:center.x,bounds.min.y,kind==='door'?0:center.z));o.add(content);
 o.scale.set(width/size.x,1,depth/size.z);o.position.set(x,y,z);o.rotation.y=rotation;
 o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});group.add(o);return o;
}
export function door(group,a,b,y=0,hand=[0,1],angle=65,thickness=.12){
 const w=Math.hypot(b[0]-a[0],b[1]-a[1]),g=new THREE.Group();g.position.set((a[0]+b[0])/2,y,(a[1]+b[1])/2);g.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);group.add(g);
 const white=interiorMaterial('Laca_marfil'),metal=interiorMaterial('Acero_cepillado');
 const box=(parent,x,y,z,w,h,d,m=white)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;};
 for(const x of [-w/2+.022,w/2-.022])box(g,x,1.075,0,.045,2.15,thickness+.035);
 box(g,0,2.15,0,w,.065,thickness+.035);const h=new THREE.Group(),sign=hand[0]?-1:1;
 h.position.x=sign*(-w/2+.045);h.rotation.y=-sign*hand[1]*angle*Math.PI/180;g.add(h);
 box(h,sign*(w-.09)/2,1.045,0,w-.09,2.09,.04);
 for(const z of [-.045,.045])box(h,sign*(w-.18),1.03,z,.12,.018,.02,metal);
 g.name='Puerta';g.userData={role:'door',opening:w,clearWidth:w-.09,hinge:hand[0],swing:hand[1],angle,evidence:'arc traced; width inferred'};return g;
}
