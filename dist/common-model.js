import * as THREE from 'three';
import {interiorMaterial,furnished,door} from './interior-detail.js?v=9';
import {equipment} from './equipment.js?v=9';
import {parkedCars} from './detailed-cars.js?v=9';
// Shared spaces follow PDF pp5/9. Unlabelled dimensions remain interpretative.
export function commonModel(floor,register){
 const g=new THREE.Group();g.name=floor===0?'Planta_baja_servicios':'SUM_comun';g.userData.floor=floor;g.position.y=floor===0?.08:15.38;
 const paint=new THREE.MeshStandardMaterial({name:'Pintura_comunes',color:0xe8e5dd,roughness:.82});register(paint);const tile=interiorMaterial('Piedra_gris'),white=interiorMaterial('Laca_marfil'),metal=interiorMaterial('Grafito');
 const box=(x,y,z,w,h,d,m=paint)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;};
 function wall(a,b,t=.16,h=2.65){const o=box((a[0]+b[0])/2,h/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1]),h,t);o.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);}
 const equip=(kind,x,z,yaw=0)=>equipment(g,kind,x,z,yaw*Math.PI/180);
 if(floor===5){
  box(0,-.10,-26.78,9.60,.20,5.35,tile);
  for(const x of [-4.80,4.80]){box(x,.53,-26.78,.035,1.06,5.35,metal);for(let z=-29.35;z<-24.1;z+=.65)box(x,.52,z,.03,1.04,.03,metal);}
  box(0,.52,-29.45,9.6,.035,.035,metal);box(0,.12,-29.45,9.6,.035,.035,metal);
  // SUM toilet in the back corner, outside the duplex circulation strips.
  wall([3.10,-25.9],[4.8,-25.9]);wall([4.8,-25.9],[4.8,-24.10]);wall([3.10,-25.9],[3.10,-24.10]);wall([3.1,-24.10],[3.3,-24.10]);wall([4.1,-24.10],[4.8,-24.10]);door(g,[3.3,-24.10],[4.1,-24.10],0,[0,1]);
  furnished(g,'toilet',4.34,0,-25.38,.43,.68,Math.PI);furnished(g,'vanity',3.53,0,-25.52,.60,.48,Math.PI);
  furnished(g,'table',-.6,0,-26.20,2.55,2.20,0);equip('bbq',-3.82,-24.53,0);equip('bench',-2.5,-28.30,0);equip('bench',1.2,-28.30,0);
  // No fictitious roof over the open shared terrace.
 }else{
  parkedCars(g,register);
  box(0,-.08,-5.3,18.0,.16,10.6,tile);
  // Bicycle enclosure, plant/service room and sanitary compartment.
  wall([5.1,-1],[5.1,-5.4],.23,3.3);wall([5.1,-5.4],[9,-5.4],.23,3.3);equip('bikeRack',7.10,-2.7,Math.PI/2*180/Math.PI);
  wall([-9,-1],[-5.15,-1],.23,3.3);wall([-9,-4.8],[-5.15,-4.8],.23,3.3);wall([-5.15,-1],[-5.15,-2.2],.23,3.3);wall([-5.15,-3.1],[-5.15,-4.8],.23,3.3);door(g,[-5.15,-2.2],[-5.15,-3.1],0,[1,-1]);equip('tank',-7.9,-2);equip('tank',-6.3,-2);
  wall([-9,-4.8],[-9,-7.2],.23,3.3);wall([-9,-7.2],[-5.15,-7.2],.23,3.3);wall([-5.15,-4.8],[-5.15,-6.0],.23,3.3);wall([-5.15,-6.8],[-5.15,-7.2],.23,3.3);door(g,[-5.15,-6],[-5.15,-6.8],0,[0,1]);
  furnished(g,'toilet',-8.3,0,-6.60,.43,.68,Math.PI);furnished(g,'vanity',-6.65,0,-6.85,.70,.48,Math.PI);
  // Hollow lift shaft with individual landing doors; dimensions inferred from plan.
  for(let f=0;f<6;f++){const y=f===0?0:3.7+(f-1)*2.9;box(2.70,y+1.35,-11.0,.16,2.70,2.0);box(4.54,y+1.35,-11.0,.16,2.70,2.0);box(3.62,y+1.35,-11.92,2.0,2.70,.16);box(3.62,y+2.40,-10.08,2.0,.50,.16);for(const x of [3.34,3.90])box(x,y+1.075,-10.08,.54,2.15,.04,metal);}
 }
 return g;
}
