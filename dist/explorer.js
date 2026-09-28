import * as THREE from 'three';
import {OrbitControls} from './assets/vendor/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from './assets/vendor/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from './assets/vendor/examples/jsm/loaders/DRACOLoader.js';
import {RoomEnvironment} from './assets/vendor/examples/jsm/environments/RoomEnvironment.js';
import {units,levels,placement} from './units.js?v=8';
import {configureDetails} from './interior-detail.js?v=8';
import {modelFromPlan} from './plan-model-v6.js?v=8';
import {commonModel} from './common-model.js?v=8';
import {batchModel} from './batch-model.js?v=8';
import {configureCars} from './detailed-cars.js?v=8';
const $=id=>document.getElementById(id);
const state={unit:'',mode:'ghost',floor:'all',cut:false,height:18.2,upper:false,ready:false,fullWalls:false};
let renderer,controls,scene,camera,building;const unitGroups=[],commonGroups=[],modelMaterials=[],unitMaterials=[];
const topPlane=new THREE.Plane(new THREE.Vector3(0,-1,0),18.2),bottomPlane=new THREE.Plane(new THREE.Vector3(0,1,0),1);
function makeUnit(unit,upper){
 const p=placement(unit,upper),g=batchModel(modelFromPlan(unit,upper,p,m=>unitMaterials.push(m)));
 Object.assign(g.userData,{unit:unit.id,upper,floor:upper?5:unit.floor});
 const label=document.createElement('button');label.className='unit-pin';label.textContent=unit.id;label.setAttribute('aria-label',`Seleccionar unidad ${unit.id}`);label.onclick=()=>chooseUnit(unit.id);$('building').append(label);
 g.userData.label=label;const c=p.point(.50,.40);g.userData.anchor=new THREE.Vector3(c[0],p.y+1.3,c[1]);scene.add(g);unitGroups.push(g);
}
function setCamera(target,offset){controls.autoRotate=false;$('rotate').setAttribute('aria-pressed','false');controls.target.set(...target);camera.position.copy(controls.target).add(new THREE.Vector3(...offset));controls.update();}
function focusUnit(){const u=units.find(u=>u.id===state.unit);if(!u)return;const p=placement(u,state.upper),a=p.point(0,0),b=p.point(1,1),k=Math.max(1,1.05/camera.aspect);setCamera([(a[0]+b[0])/2,p.y+.6,(a[1]+b[1])/2],[10*k,15*k,(p.rear?-15:15)*k]);}
function apply(){
 if(!state.ready)return;const u=units.find(u=>u.id===state.unit),isolated=!!u&&state.mode==='isolate';let height=state.height,bottom=-1;
 if(u){height=levels[state.upper?5:u.floor]+(state.fullWalls?2.8:1.35);bottom=levels[state.upper?5:u.floor]-(state.upper?2.95:.14);}else if(state.floor!=='all')bottom=levels[+state.floor]-.14;
 topPlane.constant=height;bottomPlane.constant=-bottom;const clips=state.cut||u?[topPlane,...(isolated||state.floor!=='all'?[bottomPlane]:[])]:[];
 [...modelMaterials,...unitMaterials].forEach(m=>{m.clippingPlanes=clips;m.needsUpdate=true;});building.visible=!isolated;
 building.traverse(o=>{if(!o.isMesh)return;o.visible=!(o.name.includes('Interior_calido')&&(state.cut||u));o.material=u?o.userData.ghost:o.userData.original;});
 unitGroups.forEach(g=>{g.visible=u?g.userData.unit===u.id&&g.userData.upper===state.upper:!state.cut||(levels[g.userData.floor]<height&&(state.floor==='all'||g.userData.floor===+state.floor));if(g.userData.upper)g.children.forEach(o=>{if(o.userData.stairPart)o.visible=!!u;if(o.userData.role==='roof')o.visible=!u;});});
 commonGroups.forEach(g=>g.visible=!u&&(g.userData.floor===0||state.floor==='all'||g.userData.floor===+state.floor));
 $('unit').value=state.unit;$('floor').value=state.floor;$('cut').checked=state.cut;$('height').value=height;$('height').disabled=!!u||!state.cut;$('floor').disabled=false;$('cut').disabled=!!u;
 $('unit-options').hidden=!u;$('upper-options').hidden=!u?.upper;
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(state.mode===b.dataset.mode)));document.querySelectorAll('[data-level]').forEach(b=>b.setAttribute('aria-pressed',String(state.upper===(b.dataset.level==='upper'))));
 $('height-value').textContent=`${height.toFixed(2)} m`;
 $('viewer-status').textContent=u?`Unidad ${u.id} · ${state.upper?'Nivel superior':'Planta principal'} · ${isolated?'Aislada':'Resto transparente'}`:state.floor!=='all'?`${state.floor==='0'?'Planta baja':state.floor+'° piso'} · Corte horizontal`:state.cut?`Corte a ${height.toFixed(2)} m`:'Edificio completo';
 $('viewer-shell').dataset.state=JSON.stringify({...state,visibleUnits:unitGroups.filter(g=>g.visible).map(g=>g.userData.unit)});
 $('unit-title').textContent=u?`Unidad ${u.id}`:'Elegí tu punto de vista';$('unit-info').textContent=u?`${u.rooms} · ${u.side} · ${u.floor}° piso${u.upper?' + nivel superior':''}. ${u.area} m² cubiertos según la presentación.`:'Elegí una de las 19 unidades, o cortá el edificio por planta para ver su distribución.';
 const page=u?u.page:state.floor==='all'?6:({'0':5,'1':6,'2':7,'3':7,'4':8,'5':9}[state.floor]);$('plan-image').src=`assets/plano-${page}.jpg`;$('plan-image').alt=u?`Plano original de la tipología ${u.type}`:'Plano original de la planta';$('plan-link').href=`assets/plano-${page}.jpg`;
}
function chooseUnit(id){if(id&&!units.some(u=>u.id===id))throw Error('Unidad inexistente');Object.assign(state,{unit:id,upper:false,floor:'all',cut:false});apply();if(id)focusUnit();else setCamera([0,8,-13],[33,24,49]);}
function chooseFloor(value){if(!['all','0','1','2','3','4','5'].includes(value))throw Error('Planta inexistente');Object.assign(state,{unit:'',upper:false,floor:value,cut:value!=='all',height:value==='all'?18.2:value==='0'?2.8:levels[+value]+1.25});apply();setCamera([0,value==='all'?8:levels[+value],-14],[23,35,29]);}
function reset(){Object.assign(state,{unit:'',upper:false,floor:'all',cut:false,height:18.2,mode:'ghost',fullWalls:false});$('full-walls').setAttribute('aria-pressed','false');$('full-walls').textContent='Ver puertas y paredes completas';apply();setCamera([0,8,-13],[33,24,49]);}
async function init(){try{
 renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.localClippingEnabled=true;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.8;
 const host=$('building');host.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','Edificio 3D: arrastrá para girar, rueda para acercar.');renderer.domElement.tabIndex=0;
 scene=new THREE.Scene();scene.background=new THREE.Color(0xe5e9e5);camera=new THREE.PerspectiveCamera(35,1,.1,350);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=7;controls.maxDistance=120;controls.maxPolarAngle=Math.PI*.49;controls.listenToKeyEvents(renderer.domElement);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;scene.environmentIntensity=.55;room.dispose();pmrem.dispose();scene.add(new THREE.HemisphereLight(0xffffff,0x9dada4,.55));const sun=new THREE.DirectionalLight(0xfff1dc,2.2);sun.position.set(-14,36,6);sun.target.position.set(0,6,-14);scene.add(sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-22,right:22,top:25,bottom:-25,near:1,far:90});sun.shadow.bias=-.00015;sun.shadow.normalBias=.025;sun.shadow.radius=3;scene.add(sun);
 const draco=new DRACOLoader();draco.setDecoderPath('assets/vendor/examples/jsm/libs/draco/gltf/');draco.setWorkerLimit(2);const loader=new GLTFLoader();loader.setDRACOLoader(draco);
 building=(await loader.loadAsync('assets/envolvente-v7.glb',p=>{$('loading').textContent=p.total?`Cargando recorrido 3D… ${Math.round(p.loaded/p.total*100)}%`:'Cargando recorrido 3D…';})).scene;scene.add(building);$('loading').textContent='Preparando interiores detallados…';unitMaterials.push(...configureDetails((await loader.loadAsync('assets/interiores.glb')).scene));configureCars((await loader.loadAsync('assets/automovil-detallado-v7.glb')).scene);draco.dispose();
 building.traverse(o=>{if(!o.isMesh)return;const m=o.material.clone();m.side=THREE.DoubleSide;o.userData.original=m;modelMaterials.push(m);o.userData.ghost=new THREE.MeshBasicMaterial({color:0x91a19a,transparent:true,opacity:.065,depthWrite:false,side:THREE.FrontSide});modelMaterials.push(o.userData.ghost);});
 for(const f of [0,5]){const g=batchModel(commonModel(f,m=>unitMaterials.push(m)));scene.add(g);commonGroups.push(g);}
 units.forEach(u=>{makeUnit(u,false);if(u.upper)makeUnit(u,true);});const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(host);resize();state.ready=true;reset();$('loading').hidden=true;$('explorer-controls').disabled=false;renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);unitGroups.forEach(g=>{const l=g.userData.label,p=g.userData.anchor.clone().project(camera);l.hidden=!state.cut||!g.visible||!!state.unit||g.userData.anchor.y>topPlane.constant+.1||p.z>1||Math.abs(p.x)>.95||Math.abs(p.y)>.95;l.style.left=`${(p.x*.5+.5)*host.clientWidth}px`;l.style.top=`${(-p.y*.5+.5)*host.clientHeight}px`;});});
 }catch(e){console.error(e);$('loading').hidden=true;$('error').hidden=false;}}
units.forEach(u=>{const o=document.createElement('option');o.value=u.id;o.textContent=`${u.id} · ${u.side} · ${u.type==='C'?'1 ambiente':u.upper?'Dúplex':'3 ambientes'}`;$('unit').append(o);});
const revealMobile=()=>{if(matchMedia('(max-width:700px)').matches)$('building').scrollIntoView({block:'start',behavior:'instant'});};
$('unit').onchange=e=>{chooseUnit(e.target.value);revealMobile();};$('floor').onchange=e=>{chooseFloor(e.target.value);revealMobile();};$('cut').onchange=e=>{state.cut=e.target.checked;if(!state.cut)state.floor='all';apply();};$('height').oninput=e=>{state.height=+e.target.value;state.floor='all';apply();};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;apply();focusUnit();});document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{state.upper=b.dataset.level==='upper';apply();focusUnit();});
$('reset').onclick=reset;$('top').onclick=()=>{if(state.unit){focusUnit();setCamera(controls.target.toArray(),[0,26,.01]);}else setCamera([0,state.floor==='all'?8:levels[+state.floor],-14],[0,57,.01]);};
const wallsToggle=document.createElement('button');wallsToggle.id='full-walls';wallsToggle.textContent='Ver puertas y paredes completas';wallsToggle.className='walls-toggle';wallsToggle.setAttribute('aria-pressed','false');wallsToggle.onclick=()=>{state.fullWalls=!state.fullWalls;wallsToggle.setAttribute('aria-pressed',String(state.fullWalls));wallsToggle.textContent=state.fullWalls?'Volver a paredes recortadas':'Ver puertas y paredes completas';apply();};$('unit-options').append(wallsToggle);
const views={front:[[0,8.8,0],[0,2,42]],perspective:[[0,8,-13],[33,24,49]],rear:[[0,8.8,-28],[0,4,-42]],roof:[[0,9,-13],[27,43,39]]};document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{if(state.ready)setCamera(...views[b.dataset.view]);});
$('rotate').onclick=()=>{if(!controls)return;controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=.7;$('rotate').setAttribute('aria-pressed',String(controls.autoRotate));};
$('fullscreen').onclick=async()=>{const s=$('viewer-shell');if(document.fullscreenElement){await document.exitFullscreen();return;}if(s.classList.contains('expanded')){s.classList.remove('expanded');return;}try{await s.requestFullscreen();}catch{s.classList.add('expanded');}};document.addEventListener('keydown',e=>{if(e.key==='Escape')$('viewer-shell').classList.remove('expanded');});$('retry').onclick=()=>location.reload();
if(document.modelContext?.registerTool){const life=new AbortController();window.addEventListener('pagehide',()=>life.abort(),{once:true});for(const tool of [
 {name:'read_building_explorer',description:'Read visible selection and available units.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({...state,units:units.map(({id,floor,type,area})=>({id,floor,type,area}))})},
 {name:'select_building_unit',description:'Select a unit in the visible 3D explorer; empty string restores the whole building.',inputSchema:{type:'object',properties:{unit:{type:'string',enum:['',...units.map(u=>u.id)]}},required:['unit'],additionalProperties:false},execute:input=>{if(!state.ready)throw Error('Modelo cargando');if(typeof input?.unit!=='string')throw Error('Unidad inválida');chooseUnit(input.unit);return {...state};}}
 ])try{Promise.resolve(document.modelContext.registerTool(tool,{signal:life.signal})).catch(console.warn);}catch(e){console.warn(e);}}
document.querySelector('.approx-note').textContent='Distribuciones interpretativas del PDF. Mobiliario y terminaciones interiores propuestos, no confirmados por el proyecto. Medidas sujetas a planos aprobados.';
init();
