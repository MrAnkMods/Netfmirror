/* player.js - attaches to player.html video element and implements UI */
(function(){
  var video = document.getElementById('video');
  var btnPlay = document.getElementById('btnPlay');
  var btnPlaySmall = document.getElementById('btnPlaySmall');
  var btnRew = document.getElementById('btnRew');
  var btnFwd = document.getElementById('btnFwd');
  var btnClose = document.getElementById('btnClose');
  var seek = document.getElementById('seek');
  var curTime = document.getElementById('curTime');
  var durTime = document.getElementById('durTime');
  var qualitySelect = document.getElementById('qualitySelect');
  var subsSelect = document.getElementById('subsSelect');
  var speedSelect = document.getElementById('speedSelect');
  var btnFull = document.getElementById('btnFull');

  // toggles
  function formatTime(s){
    if (!s || isNaN(s)) return '00:00';
    s = Math.floor(s);
    var hh = Math.floor(s/3600);
    var mm = Math.floor((s%3600)/60);
    var ss = s%60;
    if (hh>0) return hh + ':' + String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0');
    return String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0');
  }

  // update time & seek
  video.addEventListener('loadedmetadata', function(){
    seek.max = 100;
    durTime.textContent = formatTime(video.duration);
  });
  video.addEventListener('timeupdate', function(){
    if (!isNaN(video.duration) && video.duration>0) {
      seek.value = (video.currentTime / video.duration) * 100;
      curTime.textContent = formatTime(video.currentTime);
    }
  });
  seek.addEventListener('input', function(){
    if (!isNaN(video.duration) && video.duration>0) {
      video.currentTime = (seek.value/100) * video.duration;
    }
  });

  // play/pause
  function togglePlay(){
    if (video.paused) { video.play(); btnPlay.textContent='⏸'; btnPlaySmall.textContent='⏸'; }
    else { video.pause(); btnPlay.textContent='⏵'; btnPlaySmall.textContent='⏵'; }
  }
  btnPlay.addEventListener('click', togglePlay);
  btnPlaySmall.addEventListener('click', togglePlay);
  video.addEventListener('play', function(){ btnPlay.textContent='⏸'; btnPlaySmall.textContent='⏸'; });
  video.addEventListener('pause', function(){ btnPlay.textContent='⏵'; btnPlaySmall.textContent='⏵'; });

  // rewind/forward
  btnRew.addEventListener('click', function(){ video.currentTime = Math.max(0, video.currentTime - 10); });
  btnFwd.addEventListener('click', function(){ video.currentTime = Math.min(video.duration, video.currentTime + 10); });

  // close button returns to home
  btnClose.addEventListener('click', function(){ window.location = 'index.html'; });

  // quality switch: swap source while preserving time
  qualitySelect.addEventListener('change', function(){
    var quality = this.value; // '720' or '1080'
    var sources = video.querySelectorAll('source');
    var chosen = null;
    for (var i=0;i<sources.length;i++){
      if (sources[i].dataset.quality === quality) { chosen = sources[i].src; break; }
    }
    if (!chosen) return;
    var cur = video.currentTime;
    var isPlaying = !video.paused && !video.ended;
    video.pause();
    // replace src
    while(video.firstChild) video.removeChild(video.firstChild);
    var s1 = document.createElement('source'); s1.src = chosen; s1.type = 'video/mp4'; s1.dataset.quality = quality;
    video.appendChild(s1);
    // reattach track if selected
    var trackUrl = (subsSelect.value === 'en') ? 'subtitles/sample.srt' : null;
    if (trackUrl){
      var t = document.createElement('track'); t.kind='subtitles'; t.label='English'; t.srclang='en'; t.src = trackUrl; t.default=true;
      video.appendChild(t);
    }
    video.load();
    video.currentTime = cur;
    if (isPlaying) { var p = video.play(); if (p && p.catch) p.catch(function(){}); }
  });

  // subtitles toggle
  subsSelect.addEventListener('change', function(){
    var val = this.value;
    // remove existing tracks
    var tracks = video.querySelectorAll('track');
    tracks.forEach(function(t){ t.remove(); });
    if (val === 'off') return;
    var track = document.createElement('track');
    track.kind = 'subtitles'; track.label = 'English'; track.srclang = 'en'; track.src = 'subtitles/sample.srt'; track.default = true;
    video.appendChild(track);
    // browsers load track asynchronously; user may need to toggle captions in built-in controls too
  });

  // speed
  speedSelect.addEventListener('change', function(){ video.playbackRate = parseFloat(this.value || 1); });

  // fullscreen
  btnFull.addEventListener('click', function(){
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  // keyboard shortcuts
  document.addEventListener('keydown', function(e){
    if (e.key === ' '){ e.preventDefault(); togglePlay(); }
    if (e.key === 'ArrowLeft') video.currentTime = Math.max(0, video.currentTime - 5);
    if (e.key === 'ArrowRight') video.currentTime = Math.min(video.duration, video.currentTime +5);
    if (e.key === 'f') { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); }
  });

  // resume: store progress in sessionStorage/localStorage (since no login)
  var storageKey = 'nm_progress';
  var saveInterval = null;
  video.addEventListener('play', function(){
    if (saveInterval) clearInterval(saveInterval);
    saveInterval = setInterval(function(){
      try {
        var p = JSON.parse(localStorage.getItem(storageKey) || '{}');
        p['sample-1'] = Math.floor(video.currentTime * 1000); // demo id
        localStorage.setItem(storageKey, JSON.stringify(p));
      } catch(e){}
    }, 5000);
  });
  video.addEventListener('pause', function(){ if (saveInterval) clearInterval(saveInterval); });

  // preload quality selection default to highest available
  window.addEventListener('load', function(){
    var sources = video.querySelectorAll('source');
    if (sources.length>1){
      // prefer 1080 if present
      for (var i=0;i<sources.length;i++){
        if (sources[i].dataset.quality === '1080'){ qualitySelect.value = '1080'; break; }
      }
    }
  });
})();