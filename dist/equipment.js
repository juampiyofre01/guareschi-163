import * as THREE from 'three';
import {interiorMaterial} from './interior-detail.js?v=9';
// Supplemental metric equipment. Unspecified dimensions are proposed, not surveyed.
export function equipment(parent,kind,x,z,yaw=0){
 const g=new THREE.Group();g.name=kind;g.position.set(x,0,z);g.rotation.y=yaw;g.userData={equipment:kind,dimensionsEvidence:'proposed'};parent.add(g);
 const white=interiorMaterial('Laca_marfil'),ceramic=interiorMaterial('Ceramica_sanitaria'),metal=interiorMaterial('Acero_cepillado'),black=interiorMaterial('Grafito'),wood=interiorMaterial('Roble_natural'),fabric=interiorMaterial('Lino_tapizado');
 const box=(x,y,z,w,h,d,m=white)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;};
 const ell=(x,y,z,w,h,d,m)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(1,20,12),m);o.position.set(x,y,z);o.scale.set(w,h,d);g.add(o);return o;};
 const leg=(x,z,h=.42)=>box(x,h/2,z,.035,h,.035,black);
 if(kind==='bidet'){ell(0,.20,0,.16,.20,.23,ceramic);ell(0,.39,.04,.20,.10,.30,ceramic);ell(0,.475,.06,.135,.008,.19,black);box(0,.50,-.20,.025,.16,.025,metal);}
 if(kind==='fridge'){box(0,1.0,0,.62,2,.64);box(0,1.35,.33,.59,1.25,.025);box(0,.35,.33,.59,.68,.025);box(.23,1.35,.36,.018,.45,.025,black);box(.23,.4,.36,.018,.2,.025,black);}
 if(kind==='armchair'){box(0,.32,0,.76,.40,.78,fabric);box(0,.62,-.32,.76,.5,.15,fabric);for(const a of [-1,1]){box(a*.34,.48,0,.13,.36,.76,fabric);for(const b of [-1,1])leg(a*.28,b*.28,.17);}box(0,.54,.04,.54,.12,.60,fabric);}
 if(kind==='bench'){box(0,.43,0,1.35,.13,.43,fabric);for(const a of [-.55,.55])for(const b of [-.15,.15])leg(a,b,.37);}
 if(kind==='bar'){box(0,.99,0,1.35,.045,.55,wood);box(0,.49,0,1.23,.96,.10,white);for(const a of [-.40,.40]){box(a,.72,.60,.36,.07,.36,wood);for(const b of [-.13,.13])for(const c of [-.13,.13])leg(a+b,.60+c,.68);}}
 if(kind==='bbq'){box(0,.45,0,1.2,.90,.66);box(0,1.05,-.29,1.2,.50,.08);for(const a of [-.56,.56])box(a,1.08,0,.08,.55,.66);box(0,1.34,0,1.2,.08,.66);box(0,.96,0,1.0,.018,.52,black);for(let i=0;i<12;i++)box(-.47+i*.085,.985,0,.012,.015,.5,metal);box(0,1.58,-.13,.45,.4,.4,black);}
 if(kind==='boiler'){box(0,1.75,0,.42,.70,.27);box(0,1.55,.14,.21,.07,.02,black);}
 if(kind==='ac'){box(0,2.28,0,.85,.29,.22);box(0,2.16,.10,.76,.018,.045,black);}
 if(kind==='bikeRack'){for(let i=0;i<10;i++){const a=(i-4.5)*.43;box(a,.25,0,.025,.5,.025,metal);box(a,.5,.27,.025,.025,.55,metal);box(a,.25,.54,.025,.5,.025,metal);}}
 if(kind==='tank'){const o=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1.25,24),white);o.position.y=.625;g.add(o);}
 return g;
}
