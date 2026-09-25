import * as THREE from 'three';
import {mergeGeometries} from './assets/vendor/examples/jsm/utils/BufferGeometryUtils.js';
// Batch only the browser representation; the editable master keeps individual objects.
export function batchModel(root){
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),groups=new Map();
 function walk(o,stair=false,roof=false){stair=stair||!!o.userData.stairPart;roof=roof||o.userData.role==='roof';
  if(o.isMesh){const key=o.material.uuid+':'+stair+':'+roof;let b=groups.get(key);if(!b){b={material:o.material,stair,roof,geometries:[]};groups.set(key,b);}const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(inverse.clone().multiply(o.matrixWorld));for(const a of Object.keys(g.attributes))if(!['position','normal','uv'].includes(a))g.deleteAttribute(a);if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));b.geometries.push(g);}
  o.children.forEach(c=>walk(c,stair,roof));
 }walk(root);root.clear();
 for(const b of groups.values()){const merged=mergeGeometries(b.geometries);if(!merged)throw Error('Geometry batching failed');const m=new THREE.Mesh(merged,b.material);m.castShadow=m.receiveShadow=true;m.userData.stairPart=b.stair;if(b.roof)m.userData.role='roof';root.add(m);b.geometries.forEach(g=>g.dispose());}return root;
}
