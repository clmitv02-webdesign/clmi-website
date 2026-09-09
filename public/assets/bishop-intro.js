/* Local filmic intro: native reversible scroll, no wheel interception or still swap. */
(() => {
  const root = document.getElementById('bishopIntro');
  if (!root) return;
  const art = root.querySelector('.bishop-intro-art');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reviewOff = new URLSearchParams(location.search).get('motion') === 'off';
  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.preload = 'auto';
  video.setAttribute('aria-hidden','true');
  video.setAttribute('disablepictureinpicture','');
  video.tabIndex = -1;
  art.append(video);
  const END = 7.5; // Settled frame of the approved film. No source-PNG overlay.
  let enabled = false, ready = false, desired = 0, raf = 0, last = 0;
  let strength = 0, pointerInside = false, pointer = [.5,.5], effect = null;
  let clientPointer = null;
  let glassPointer = [.5,.5];
  let ambient = null;
  let visibility = true;
  let loadTimeout;
  const clamp = (v,lo=0,hi=1) => Math.max(lo,Math.min(hi,v));

  function chrome() {
    const r = root.getBoundingClientRect();
    document.body.classList.toggle('bishop-intro-visible',r.bottom >= innerHeight && r.top < innerHeight);
  }
  function wake() { if (!raf) raf=requestAnimationFrame(tick); }
  function fallback() {
    enabled=ready=false; clearTimeout(loadTimeout);
    root.classList.remove('is-enhanced','is-painted','is-reacting','has-ambient');
    root.dataset.state='static'; root.dataset.reaction='0';
    video.removeAttribute('src'); video.load();
    if(effect) effect.canvas.style.visibility='hidden';
    chrome();
  }
  function configure() {
    if (reduce.matches || reviewOff) { fallback(); return; }
    enabled=true; ready=false;
    if(!ambient)ambient=createAmbient();
    root.classList.add('is-enhanced');
    root.dataset.state='loading';
    video.src=innerWidth<=768?'/assets/video/bishop-intro-mobile.mp4':'/assets/video/bishop-intro-desktop.mp4';
    video.load();
    loadTimeout=setTimeout(()=>{if(!ready)fallback();},15000);
    wake();
  }
  function update() {
    chrome();
    if (!enabled) return;
    const rect=root.getBoundingClientRect();
    const progress=clamp(-rect.top/Math.max(1,root.offsetHeight-innerHeight));
    desired=clamp(progress/.9)*END;
    root.dataset.scVerifyHold=String(progress>=.9);
    root.style.setProperty('--welcome-opacity',(1-clamp(progress/.13)).toFixed(3));
    root.style.setProperty('--welcome-y',`${-32*clamp(progress/.13)}px`);
    visibility=rect.bottom>0 && rect.top<innerHeight && !document.hidden;
    root.style.setProperty('--ambient-opacity',clamp((desired-.85)/1.2).toFixed(3));
    root.classList.toggle('has-ambient',visibility && ready && desired>.85);
    locatePointer();
    wake();
  }
  function tick(now) {
    raf=0;
    const dt=Math.min(40,now-(last||now)); last=now;
    if (!enabled || !ready) return;
    const settled=Math.abs(video.currentTime-desired)<1/30 && !video.seeking;
    if(!video.seeking && !settled) video.currentTime=desired;
    const revealed=desired>=END-.01 && settled;
    root.dataset.state=revealed?'revealed':'scrubbing';
    const target=desired>.85 && fine.matches && pointerInside && visibility?1:0;
    strength+=(target-strength)*(1-Math.exp(-dt/110));
    if(strength<.001)strength=0;
    const follow=1-Math.exp(-dt/65);
    glassPointer=glassPointer.map((p,i)=>p+(pointer[i]-p)*follow);
    const moving=Math.hypot(glassPointer[0]-pointer[0],glassPointer[1]-pointer[1])>.00005;
    root.dataset.reaction=strength.toFixed(3);
    if (effect) {
      if(strength>0) {
        effect.canvas.style.visibility='visible';
        effect.draw(glassPointer,strength);
      } else effect.canvas.style.visibility='hidden';
    }
    root.classList.toggle('is-reacting',!!effect && strength>0);
    // Report painted media, not just raw wheel progress.
    root.dataset.scVerifyState=JSON.stringify({frame:Math.round(video.currentTime*24),reaction:Number(strength.toFixed(2))});
    // A stationary magnifier needs no perpetual GPU loop; input and decoded
    // frames wake it again, while focus-in/out is allowed to finish.
    if (!settled || Math.abs(target-strength)>.001 || (strength>0 && moving)) wake();
  }
  video.addEventListener('loadeddata',()=>{
    if(!enabled)return;
    ready=true; clearTimeout(loadTimeout);
    root.classList.add('is-painted');
    if(fine.matches && !effect)effect=createReaction(video,art);
    update();
  });
  video.addEventListener('seeked',()=>{
    if(effect)effect.dirty=true;
    wake();
  });
  video.addEventListener('error',()=>{if(enabled)fallback();});
  function leave(){clientPointer=null;pointerInside=false;wake();}
  function locatePointer(){
    if(!clientPointer || !fine.matches || !ready){pointerInside=false;return;}
    const [x,y]=clientPointer;
    const r=video.getBoundingClientRect();
    const stage=art.getBoundingClientRect();
    pointer=[(x-r.left)/r.width,(y-r.top)/r.height];
    pointerInside=x>=stage.left && x<=stage.right && y>=stage.top && y<=stage.bottom &&
      pointer[0]>.27 && pointer[0]<.75 && pointer[1]>.02 && pointer[1]<1;
  }
  function point(e){
    if(!fine.matches)return;
    clientPointer=[e.clientX,e.clientY];locatePointer();
    if(strength===0)glassPointer=[...pointer];
    wake();
  }
  art.addEventListener('pointermove',point);
  // Wheel coordinates keep the lens discoverable with a stationary mouse.
  art.addEventListener('wheel',point,{passive:true});
  art.addEventListener('pointerleave',leave);
  addEventListener('scroll',update,{passive:true});
  addEventListener('resize',()=>{if(effect)effect.resize();if(ambient)ambient.resize();update();},{passive:true});
  document.addEventListener('visibilitychange',()=>{leave();update();});
  reduce.addEventListener('change',configure);
  fine.addEventListener('change',()=>{if(fine.matches&&ready&&!effect)effect=createReaction(video,art);leave();});
  configure();chrome();

  // A separate, pointer-transparent layer keeps the approved film and word
  // portrait intact. CSS transforms continue gently while the playhead rests.
  function createAmbient(){
    const layer=document.createElement('div');
    layer.className='bishop-ambient';layer.setAttribute('aria-hidden','true');
    const dots=Array.from({length:24},(_,i)=>{
      const dot=document.createElement('i');
      dot.style.cssText=`--dust-size:${(.8+(i%5)*.32).toFixed(2)}px;--dust-duration:${9+(i%7)*.8}s;--dust-delay:${-i*2.37}s;--dust-drift:${(i%3-1)*8}px;--dust-rise:${120+(i%4)*22}px;top:${12+(i*37)%82}%;`;
      layer.append(dot);return dot;
    });
    root.querySelector('.bishop-intro-stage').append(layer);
    const state={resize(){
      const stage=art.getBoundingClientRect(),frame=video.getBoundingClientRect();
      const clearance=stage.width<=768?4:18;
      const left=Math.max(0,frame.left-stage.left+frame.width*.30-clearance);
      const right=Math.min(stage.width,frame.left-stage.left+frame.width*.72+clearance);
      dots.forEach((dot,i)=>{
        const fraction=.15+((i*7)%12)/12*.65;
        const x=i%2===0?fraction*left:right+fraction*(stage.width-right);
        dot.style.left=`${x}px`;
        dot.style.setProperty('--dust-drift',`${(i%3-1)*(stage.width<=768?2:8)}px`);
      });
    }};
    state.resize();return state;
  }

  // Pointer-centred magnification, informed by Aceternity Lens and Codrops'
  // interactive WebGL zoom. Sample the actual decoded frame, not a second video.
  function createReaction(source,parent) {
    const canvas=document.createElement('canvas');
    const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
    if(!gl)return null;
    const shader=(type,code)=>{
      const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Portrait shader unavailable');
      return s;
    };
    try {
      const program=gl.createProgram();
      gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 pos; varying vec2 uv; void main(){uv=pos*.5+.5;gl_Position=vec4(pos,0.,1.);}'));
      gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
        precision highp float;
        varying vec2 uv;
        uniform sampler2D frame;
        uniform vec2 mouse;
        uniform vec2 fit;
        uniform vec2 texel;
        uniform float amount;
        uniform float lensRadius;
        void main(){
          vec2 p=(vec2(uv.x,1.-uv.y)-.5)/fit+.5;
          if(p.x<0.||p.x>1.||p.y<0.||p.y>1.){gl_FragColor=vec4(vec3(24./255.),1.);return;}
          vec2 d=(p-mouse)*vec2(1.777778,1.);
          float radius=length(d);
          // Continuous refraction, not a clipped circular window: the influence
          // falls away across the entire small footprint, with no visible rim.
          float falloff=exp(-3.5*radius*radius/(lensRadius*lensRadius));
          float field=falloff*(1.-smoothstep(lensRadius*.65,lensRadius,radius))*amount;
          vec2 zoomed=mouse+(p-mouse)/(1.+.18*field);
          vec3 detail=texture2D(frame,zoomed).rgb;
          vec3 nearby=(texture2D(frame,zoomed+vec2(texel.x,0.)).rgb+
            texture2D(frame,zoomed-vec2(texel.x,0.)).rgb+
            texture2D(frame,zoomed+vec2(0.,texel.y)).rgb+
            texture2D(frame,zoomed-vec2(0.,texel.y)).rgb)*.25;
          // A restrained local contrast lift clarifies existing strokes; no
          // painted highlight, glow, new detail or background decoration.
          gl_FragColor=vec4(clamp(detail+(detail-nearby)*.16*field,0.,1.),1.);
        }`));
      gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))return null;
      gl.useProgram(program);
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const loc=gl.getAttribLocation(program,'pos');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
      const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      const uniforms=Object.fromEntries(['mouse','fit','texel','amount','lensRadius'].map(k=>[k,gl.getUniformLocation(program,k)]));
      const state={canvas,dirty:true,resize(){
        const r=source.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,2);
        canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);
        gl.viewport(0,0,canvas.width,canvas.height);
        const scale=Math.min(r.width/1920,r.height/1080);
        gl.uniform2f(uniforms.fit,1920*scale/r.width,1080*scale/r.height);
        gl.uniform1f(uniforms.lensRadius,Math.min(95,r.width*.1)/r.height);
        gl.uniform2f(uniforms.texel,1/source.videoWidth,1/source.videoHeight);
      },draw(mouse,amount){
        if(state.dirty){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,source);state.dirty=false;}
        gl.uniform2f(uniforms.mouse,...mouse);gl.uniform1f(uniforms.amount,amount);
        gl.drawArrays(gl.TRIANGLES,0,6);
      }};
      parent.append(canvas);state.resize();
      canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();canvas.style.visibility='hidden';effect=null;root.classList.remove('is-reacting');});
      return state;
    }catch { return null; } // Formation/scroll remain available without WebGL.
  }
})();
