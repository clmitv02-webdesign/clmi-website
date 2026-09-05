/* Gentle dissolve and glide; arrows are the only visible controls. */
(() => {
  const gallery=document.getElementById('galleryShowcase');
  if(!gallery)return;
  const cards=[...gallery.querySelectorAll('.gallery-card')];
  const viewport=gallery.querySelector('.gallery-viewport');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const reviewOff=new URLSearchParams(location.search).get('motion')==='off';
  const AUTOPLAY_MS=7200;
  let page=0,timer,pointerX=null,visible=false,focused=false,paused=false;
  const motionOff=()=>reduced.matches||reviewOff;
  function pause(){clearTimeout(timer);}
  function restart(){
    pause();
    gallery.classList.toggle('gallery-still',motionOff());
    if(!motionOff()&&!paused&&!focused&&visible&&!document.hidden) timer=setTimeout(()=>show(page+1),AUTOPLAY_MS);
  }
  function show(next){
    page=(next+cards.length)%cards.length;
    cards.forEach((card,i)=>{card.classList.toggle('is-active',i===page);card.setAttribute('aria-hidden',String(i!==page));});
    cards[(page+1)%cards.length].querySelector('img').loading='eager';
    restart();
  }
  gallery.querySelector('.gallery-prev').addEventListener('click',()=>show(page-1));
  gallery.querySelector('.gallery-next').addEventListener('click',()=>show(page+1));
  gallery.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(page+(e.key==='ArrowLeft'?-1:1));}
    if(e.key===' '&&e.target===viewport){e.preventDefault();paused=!paused;restart();}
  });
  viewport.addEventListener('pointerdown',e=>{pointerX=e.clientX;pause();});
  viewport.addEventListener('pointerup',e=>{if(pointerX===null)return;const dx=e.clientX-pointerX;pointerX=null;if(Math.abs(dx)>50)show(page+(dx<0?1:-1));else restart();});
  viewport.addEventListener('pointercancel',()=>{pointerX=null;restart();});
  gallery.addEventListener('focusin',e=>{focused=e.target.matches(':focus-visible');restart();});
  gallery.addEventListener('focusout',e=>{if(!gallery.contains(e.relatedTarget)){focused=false;restart();}});
  document.addEventListener('visibilitychange',restart);
  reduced.addEventListener('change',restart);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;restart();},{threshold:.1}).observe(gallery);
  show(0);
})();
