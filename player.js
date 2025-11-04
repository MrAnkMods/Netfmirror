const v = document.getElementById('video');
const playBtn = document.getElementById('btnPlay');
const fwd = document.getElementById('btnFwd');
const back = document.getElementById('btnBack');
const full = document.getElementById('btnFull');
const fit = document.getElementById('btnFit');
const progress = document.getElementById('progressFill');
const knob = document.getElementById('progressKnob');
const wrap = document.getElementById('progressWrap');
const timeNow = document.getElementById('currentTime');
const timeDur = document.getElementById('duration');
const close = document.getElementById('btnClose');
const ui = document.getElementById('playerUI');
let fitMode = 'contain'; // default

function fmt(s){
  if(!s) return "00:00";
  let m=Math.floor(s/60), sec=Math.floor(s%60);
  return `${m<10?'0'+m:m}:${sec<10?'0'+sec:sec}`;
}

// play/pause
playBtn.onclick=()=>{
  if(v.paused){v.play(); playBtn.textContent='⏸';}
  else {v.pause(); playBtn.textContent='⏵';}
};

v.onplay=()=>playBtn.textContent='⏸';
v.onpause=()=>playBtn.textContent='⏵';

back.onclick=()=>v.currentTime=Math.max(0,v.currentTime-10);
fwd.onclick=()=>v.currentTime=Math.min(v.duration,v.currentTime+10);

v.ontimeupdate=()=>{
  const pct=(v.currentTime/v.duration)*100;
  progress.style.width=pct+"%";
  knob.style.left=pct+"%";
  timeNow.textContent=fmt(v.currentTime);
};
v.onloadedmetadata=()=>{timeDur.textContent=fmt(v.duration);};

wrap.onclick=(e)=>{
  const r=wrap.getBoundingClientRect();
  const pct=(e.clientX-r.left)/r.width;
  v.currentTime=pct*v.duration;
};

// fullscreen toggle
full.onclick=()=>{
  if(!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};

// fit screen toggle
fit.onclick=()=>{
  if(fitMode==='contain'){ v.style.objectFit='cover'; fit.textContent='Original'; fitMode='cover'; }
  else { v.style.objectFit='contain'; fit.textContent='Fit Screen'; fitMode='contain'; }
};

// auto-hide controls
let timer;
function showUI(){
  ui.style.opacity=1; ui.style.pointerEvents='auto';
  clearTimeout(timer);
  timer=setTimeout(()=>{ui.style.opacity=0; ui.style.pointerEvents='none';},3000);
}
['mousemove','touchstart','click'].forEach(e=>document.addEventListener(e,showUI));
showUI();

// close
close.onclick=()=>history.back();