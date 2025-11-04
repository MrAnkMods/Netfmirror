(function(){
  const v = document.getElementById('video');
  const ui = document.getElementById('playerUI');
  const container = document.getElementById('playerContainer');
  const seek = document.getElementById('seek');
  const cur = document.getElementById('curTime');
  const dur = document.getElementById('durTime');
  const btnPlay = document.getElementById('btnPlay');
  const btnRew = document.getElementById('btnRew');
  const btnFwd = document.getElementById('btnFwd');
  const btnFull = document.getElementById('btnFull');
  const btnClose = document.getElementById('btnClose');
  const qualitySelect = document.getElementById('qualitySelect');
  const subsSelect = document.getElementById('subsSelect');
  const speedSelect = document.getElementById('speedSelect');
  const playerTitle = document.getElementById('playerTitle');
  
  const movie = window.movies[0];
  playerTitle.textContent = movie.title;

  // Load qualities
  for (let q in movie.sources) {
    let opt = document.createElement('option');
    opt.value = q; opt.textContent = q + "p";
    qualitySelect.appendChild(opt);
  }
  qualitySelect.value = Object.keys(movie.sources)[0];

  // Load subs
  subsSelect.innerHTML = '<option value="off">Subs Off</option>';
  for (let s in movie.subtitles) {
    let opt = document.createElement('option');
    opt.value = s; opt.textContent = s.toUpperCase();
    subsSelect.appendChild(opt);
  }

  function fmt(sec){
    if(!sec) return "00:00";
    sec = Math.floor(sec);
    const m = Math.floor(sec/60), s = sec%60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }

  v.addEventListener('loadedmetadata', ()=> dur.textContent = fmt(v.duration));
  v.addEventListener('timeupdate', ()=>{
    seek.value = (v.currentTime / v.duration)*100;
    cur.textContent = fmt(v.currentTime);
  });
  seek.addEventListener('input', ()=> v.currentTime = (seek.value/100)*v.duration);

  btnPlay.onclick = ()=> { 
    if(v.paused){ v.play(); btnPlay.textContent='⏸'; } 
    else { v.pause(); btnPlay.textContent='▶'; }
  };
  v.onplay = ()=> btnPlay.textContent='⏸';
  v.onpause = ()=> btnPlay.textContent='▶';
  btnRew.onclick = ()=> v.currentTime -= 10;
  btnFwd.onclick = ()=> v.currentTime += 10;

  btnFull.onclick = ()=> {
    if(!document.fullscreenElement) container.requestFullscreen();
    else document.exitFullscreen();
  };
  btnClose.onclick = ()=> window.location='index.html';

  speedSelect.onchange = ()=> v.playbackRate = parseFloat(speedSelect.value);
  qualitySelect.onchange = ()=>{
    const t = v.currentTime;
    v.src = movie.sources[qualitySelect.value];
    v.currentTime = t;
    v.play();
  };

  subsSelect.onchange = ()=>{
    v.querySelectorAll('track').forEach(t=>t.remove());
    if(subsSelect.value==='off') return;
    const track = document.createElement('track');
    track.kind='subtitles'; track.srclang=subsSelect.value;
    track.label=subsSelect.value.toUpperCase();
    track.src=movie.subtitles[subsSelect.value];
    track.default=true;
    v.appendChild(track);
  };

  // Auto hide UI
  let hideTimer;
  const showUI = ()=>{ ui.style.opacity=1; clearTimeout(hideTimer);
    hideTimer=setTimeout(()=>ui.style.opacity=0,3000); };
  document.onmousemove=showUI; v.onclick=showUI; showUI();
})();