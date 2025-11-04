/* Netflix-like custom HTML5 player */
(function(){
  // movie load: from query or demo
  const q = new URLSearchParams(location.search);
  const id = q.get('id');
  const movie = (window.movies || []).find(m=>m.id===id) || (window.movies && window.movies[0]) || {
    title:'Demo', sources:{"720p":"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}, subtitles:{}
  };

  // elements
  const container = document.getElementById('playerContainer');
  const v = document.getElementById('video');
  const ui = document.getElementById('playerUI');
  const brightness = document.getElementById('brightness');
  const bigPlay = document.getElementById('bigPlay');
  const btnSkipBack = document.getElementById('btnSkipBack');
  const btnSkipFwd = document.getElementById('btnSkipFwd');
  const progressFill = document.getElementById('progressFill');
  const knob = document.getElementById('knob');
  const progressWrap = document.getElementById('progressWrap');
  const timeRight = document.getElementById('timeRight');
  const titleTop = document.getElementById('titleTop');
  const btnFull = document.getElementById('btnFull');
  const btnClose = document.getElementById('btnClose');
  const btnSpeed = document.getElementById('btnSpeed');
  const btnLock = document.getElementById('btnLock');
  const btnEpisodes = document.getElementById('btnEpisodes');
  const btnSubs = document.getElementById('btnSubs');
  const btnServers = document.getElementById('btnServers');
  const btnNext = document.getElementById('btnNext');
  const modal = document.getElementById('modal');
  const btnGrid = document.getElementById('btnGrid');
  const btnSettings = document.getElementById('btnSettings');

  // set title
  titleTop.textContent = movie.title || "";

  // choose default source (prefer highest quality key)
  const qkeys = Object.keys(movie.sources || {});
  const chosenKey = qkeys.length ? qkeys[qkeys.length-1] : null;
  if (chosenKey) v.src = movie.sources[chosenKey];

  // subtitles
  if (movie.subtitles){
    for (const k in movie.subtitles){
      const url = movie.subtitles[k];
      if (!url) continue;
      const t = document.createElement('track');
      t.kind = 'subtitles'; t.label = k.toUpperCase(); t.srclang = k; t.src = url; t.default = true;
      v.appendChild(t);
    }
  }

  // format time
  function fmt(s){ if (!s || isNaN(s)) return "00:00"; s=Math.floor(s); const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const sec=s%60; if(h>0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; }

  // update timeline
  v.addEventListener('loadedmetadata', ()=>{
    timeRight.textContent = fmt(v.duration);
    // resume
    try{ const p=JSON.parse(localStorage.getItem('nm_progress')||'{}'); const pos=p[movie.id]||0; if(pos>0 && v.duration>pos) v.currentTime = pos; }catch(e){}
  });
  v.addEventListener('timeupdate', ()=>{
    if (!v.duration) return;
    const pct = (v.currentTime / v.duration) * 100;
    progressFill.style.width = pct + "%";
    knob.style.left = pct + "%";
    // update current small time if exists
    timeRight.textContent = fmt(v.duration);
  });

  // play/pause toggle
  function togglePlay(){ if (v.paused){ v.play().catch(()=>{}); bigPlay.textContent='⏸'; } else { v.pause(); bigPlay.textContent='▶'; } }
  bigPlay.addEventListener('click', togglePlay);
  v.addEventListener('play', ()=> bigPlay.textContent='⏸');
  v.addEventListener('pause', ()=> bigPlay.textContent='▶');

  // skip
  btnSkipBack.addEventListener('click', ()=> v.currentTime = Math.max(0, v.currentTime - 10));
  btnSkipFwd.addEventListener('click', ()=> v.currentTime = Math.min(v.duration||0, v.currentTime + 10));

  // progress seeking (drag/click)
  let dragging = false;
  progressWrap.addEventListener('pointerdown', e=>{
    dragging = true; seekTo(e);
    const move=(ev)=> seekTo(ev);
    const up=()=>{ dragging=false; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  });
  function seekTo(e){
    const r = progressWrap.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - r.left), r.width);
    const pct = x / r.width;
    if (v.duration) v.currentTime = pct * v.duration;
  }

  // brightness
  brightness && brightness.addEventListener('input', ()=> { const val = brightness.value/100; v.style.filter = `brightness(${val})`; });

  // fullscreen
  btnFull.addEventListener('click', ()=> { if (!document.fullscreenElement) container.requestFullscreen().catch(()=>{}); else document.exitFullscreen(); });

  // close
  btnClose.addEventListener('click', ()=> { history.back(); });

  // keyboard shortcuts
  document.addEventListener('keydown', e=>{
    if (e.key === ' '){ e.preventDefault(); togglePlay(); }
    if (e.key === 'ArrowLeft') v.currentTime = Math.max(0, v.currentTime - 5);
    if (e.key === 'ArrowRight') v.currentTime = Math.min(v.duration||0, v.currentTime + 5);
    if (e.key === 'f') { if (!document.fullscreenElement) container.requestFullscreen(); else document.exitFullscreen(); }
  });

  // auto-hide UI
  let uiTimer;
  function showUI(){ ui.style.opacity=1; ui.style.pointerEvents='auto'; clearTimeout(uiTimer); uiTimer=setTimeout(()=>{ ui.style.opacity=0; ui.style.pointerEvents='none'; }, 3000); }
  ['mousemove','pointerdown','touchstart'].forEach(ev => document.addEventListener(ev, showUI));
  showUI();

  // save progress every 5s while playing
  let saveInt;
  v.addEventListener('play', ()=> { clearInterval(saveInt); saveInt = setInterval(()=>{ try{ const p=JSON.parse(localStorage.getItem('nm_progress')||'{}'); p[movie.id]=Math.floor(v.currentTime); localStorage.setItem('nm_progress',JSON.stringify(p)); }catch(e){} },5000); });
  v.addEventListener('pause', ()=> { clearInterval(saveInt); });

  // speed toggle
  btnSpeed.addEventListener('click', ()=> {
    const rates = [1,1.25,1.5,2];
    const idx = rates.indexOf(v.playbackRate);
    const next = rates[(idx+1)%rates.length];
    v.playbackRate = next; btnSpeed.textContent = `Speed (${next}x)`;
  });

  // lock toggle
  let locked = false;
  btnLock.addEventListener('click', ()=> {
    locked = !locked; container.classList.toggle('locked', locked);
    btnLock.textContent = locked ? 'Locked' : 'Lock';
    if (locked){ ui.style.opacity = 0.9; ui.style.pointerEvents = 'none'; } else { showUI(); }
  });

  // modals for episodes/subs/server/settings/next
  function showModal(html){
    modal.classList.remove('hidden'); modal.innerHTML = html + '<div style="height:14px"></div><button id="modalClose" class="btn">Close</button>';
    modal.querySelector('#modalClose').addEventListener('click', ()=> modal.classList.add('hidden'));
  }
  btnEpisodes.addEventListener('click', ()=> showModal('<strong>Episodes</strong><br><small>Demo list</small>'));
  btnSubs.addEventListener('click', ()=> showModal('<strong>Audio & Subtitles</strong><br><small>Choose audio/subtitles</small>'));
  btnServers.addEventListener('click', ()=> showModal('<strong>Server</strong><br><small>Choose server (demo)</small>'));
  btnSettings && btnSettings.addEventListener('click', ()=> showModal('<strong>Settings</strong><br><small>Player settings</small>'));
  btnNext.addEventListener('click', ()=> alert('Next episode (demo)'));

  // grid/episodes button
  btnGrid.addEventListener('click', ()=> showModal('<strong>Episodes Grid</strong><br><small>Episode thumbnails here</small>'));

  // PiP if available (grid button reused)
  const btnPip = document.getElementById('btnPip');
  btnPip && btnPip.addEventListener('click', async ()=> { try { if (document.pictureInPictureElement) await document.exitPictureInPicture(); else await v.requestPictureInPicture(); } catch(e){ console.warn(e); } });

  // initial user-tap to play for mobile autoplay policy
  container.addEventListener('click', function oncePlay(){ if (v.paused) { v.play().catch(()=>{}); bigPlay.textContent='⏸'; } }, { once: true });

  // expose for debugging
  window.nmplayer = { video: v, movie: movie };
})();