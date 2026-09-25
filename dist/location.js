const frame=document.querySelector('.map-frame iframe'),button=document.getElementById('load-map'),status=document.getElementById('map-status');
let timer;
button.addEventListener('click',()=>{
 button.disabled=true;status.textContent='Cargando Google Maps…';frame.hidden=false;frame.src=frame.dataset.src;
 timer=setTimeout(()=>{frame.hidden=true;button.disabled=false;button.textContent='Reintentar Google Maps';status.textContent='Google Maps está tardando en responder. Podés usar el enlace «Abrir en Google Maps».';},12000);
});
frame.addEventListener('load',()=>{if(!frame.getAttribute('src'))return;clearTimeout(timer);frame.hidden=false;button.hidden=true;status.textContent='Mapa interactivo de Google Maps.';});
