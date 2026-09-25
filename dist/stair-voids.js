import * as THREE from 'three';
import {layouts} from './plan-layouts.js';
import {units,placement} from './units.js';
// The old exterior GLB was joined by material. Cut just its roof-slab skin
// inside the four traced stair wells; keep every other structural surface.
const holes=units.filter(u=>u.upper).map(u=>{const p=placement(u),s=layouts[u.type].stair,a=p.point(...s[0]),b=p.point(...s[1]);return new THREE.Vector4(Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1]));});
export function roofOpenings(material){
 material.onBeforeCompile=shader=>{shader.uniforms.stairVoids={value:holes};shader.vertexShader='varying vec3 stairWorld;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nstairWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');shader.fragmentShader='varying vec3 stairWorld;\nuniform vec4 stairVoids[4];\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
 if(stairWorld.y > 15.10 && stairWorld.y < 15.43){
  for(int i=0;i<4;i++){vec4 h=stairVoids[i];if(stairWorld.x>h.x&&stairWorld.x<h.y&&stairWorld.z>h.z&&stairWorld.z<h.w)discard;}
 }`);};
 material.customProgramCacheKey=()=> 'guareschi-stair-voids-v1';return material;
}
