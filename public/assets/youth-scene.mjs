import { sceneState } from './youth-scene-model.mjs';
const scene = document.querySelector('.youth-scene');
if (scene) {
  const video = scene.querySelector('video');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const reviewOff = new URLSearchParams(location.search).get('motion') === 'off';
  let queued=false;
  function paint() {
    queued=false;
    if(reduce.matches || reviewOff) return;
    const box=scene.getBoundingClientRect();
    if(box.bottom<0 || box.top>innerHeight) return;
    const state=sceneState(box.top,box.height,innerHeight,video.duration);
    scene.style.setProperty('--youth-drift',state.drift.toFixed(2)+'px');
    if(video.readyState>=2 && !video.seeking && Math.abs(video.currentTime-state.time)>.04) video.currentTime=state.time;
    scene.dataset.scVerifyState=JSON.stringify({time:Number(video.currentTime.toFixed(2)),drift:Number(state.drift.toFixed(2))});
  }
  function queue(){ if(!queued){queued=true;requestAnimationFrame(paint);} }
  function sync(){
    const off=reduce.matches||reviewOff;
    scene.classList.toggle('scene-static',off);
    if(off){video.pause();video.removeAttribute('src');video.load();scene.style.removeProperty('--youth-drift');}
    else if(!video.getAttribute('src')){video.preload='auto';video.src=video.dataset.src;video.load();}
    queue();
  }
  video.addEventListener('loadeddata',queue);
  video.addEventListener('seeked',queue);
  addEventListener('scroll',queue,{passive:true});
  addEventListener('resize',queue);
  reduce.addEventListener('change',sync);
  sync();
}
