const model=document.getElementById('building');
const status=document.getElementById('loading');
const error=document.getElementById('error');
const views={front:['0m 8.8m 0m','0deg 87deg 42m'],perspective:['0m 8m -11m','35deg 67deg 70m'],rear:['0m 8.8m -28m','180deg 82deg 42m'],roof:['0m 9m -13m','35deg 33deg 75m']};
let loaded=false;
model.addEventListener('load',()=>{loaded=true;status.hidden=true;error.hidden=true;});
model.addEventListener('progress',e=>{if(!loaded)status.textContent=`Cargando recorrido 3D… ${Math.round(e.detail.totalProgress*100)}%`;});
model.addEventListener('error',()=>{status.hidden=true;error.hidden=false;});
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
  const [target,orbit]=views[button.dataset.view];model.cameraTarget=target;model.cameraOrbit=orbit;
  model.autoRotate=false;document.getElementById('rotate').setAttribute('aria-pressed','false');
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
}));
document.getElementById('rotate').addEventListener('click',e=>{model.autoRotate=!model.autoRotate;model.autoRotateDelay=0;model.rotationPerSecond='8deg';e.currentTarget.setAttribute('aria-pressed',String(model.autoRotate));});
const shell=document.getElementById('viewer-shell');
document.getElementById('fullscreen').addEventListener('click',async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else if(shell.requestFullscreen)await shell.requestFullscreen();else shell.classList.toggle('expanded');}
  catch{shell.classList.toggle('expanded');}
  document.getElementById('fullscreen').textContent=document.fullscreenElement||shell.classList.contains('expanded')?'Reducir':'Ampliar';
});
document.addEventListener('fullscreenchange',()=>{document.getElementById('fullscreen').textContent=document.fullscreenElement?'Reducir':'Ampliar';});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){shell.classList.remove('expanded');document.getElementById('fullscreen').textContent='Ampliar';}});
document.getElementById('retry').addEventListener('click',()=>{error.hidden=true;status.hidden=false;loaded=false;model.src=`assets/guareschi-163.glb?retry=${Date.now()}`;});
setTimeout(()=>{if(!customElements.get('model-viewer')){status.hidden=true;error.hidden=false;}},15000);
