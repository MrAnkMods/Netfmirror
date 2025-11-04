/* player.js - attaches to player.html video element and implements UI */
(function(){
  var q = new URLSearchParams(location.search);
  var movieId = q.get('id') || 'sample-1';
  var movie = (window.movies || []).find(function(x){ return x.id === movieId; }) || window.movies[0];

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
  var playerTitle = document.getElementById('playerTitle');

  if (playerTitle) playerTitle.textContent = movie.title;

  // populate qualitySelect
  (function populateQualities(){
    var qs = Object.keys(movie.sources || {});
    qualitySelect.innerHTML = '';
    qs.forEach(function(k){
      var opt = document.createElement('option');
      opt.value = k;
      opt.textContent = k + 'p';
      qualitySelect.appendChild(opt);
    });
    if (qs.length === 1) qualitySelect.style.display = 'none';
  })();

  // populate subsSelect
  (function populateSubs(){
    subsSelect.innerHTML = '<option value="off">Subs Off</option>';
    for (var lang in (movie.subtitles||{})){
      var opt = document.createElement('option');
      opt.value = lang;
      opt.textContent = (lang === 'en') ? 'English' : lang;
      subsSelect.appendChild(opt);
    }
    // if none, keep only Off
  })();

  // helper: format time
  function formatTime(s){
    if (!s || isNaN(s)) return '00:00';
    s = Math.floor(s);
    var hh = Math.floor(s/3600);
    var mm = Math.floor((s%3600)/60);
    var ss = s%60;
    if (hh>0) return hh + ':' + String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0');
    return String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0');
  }

  // load initial source
  function setSourceForQuality(quality){
    var url = movie.sources[quality] || Object.values(movie.sources)[0];
    // remove existing sources & tracks
    while(video.firstChild) video.removeChild(video.firstChild);
    var s = document.createElement('source'); s.src = url; s.type = 'video/mp4'; s.dataset.quality = quality;
    video.appendChild(s);
    video.load();
  }

  // subtitle helper: convert .srt -> vtt blob (if needed) and attach
  function attachSubtitle(subUrl, lang){
    // remove existing tracks
    var tracks = video.querySelectorAll('track');
    tracks.forEach(function(t){ t.remove(); });
    if (!subUrl) return;

    // if file endsWith .vtt -> attach directly
    if (subUrl.toLowerCase().endsWith('.vtt')){
      var t = document.createElement('track');
      t.kind='subtitles'; t.label = lang || 'Subs'; t.srclang = lang || 'en'; t.src = subUrl; t.default=true;
      video.appendChild(t);
      return;
    }

    // otherwise try fetch and convert .srt -> vtt
    fetch(subUrl).then(function(r){
      if (!r.ok) throw new Error('subtitle fetch failed');
      return r.text();
    }).then(function(srt){
      var vtt = 'WEBVTT\n\n' + srt
        .replace(/\r/g, '')
        .split('\n\n')
        .map(function(block){
          // if numeric index line present, remove
          var lines = block.split('\n');
          if (lines.length && /^\d+$/.test(lines[0])) lines.shift();
          if (lines.length && /\d{2}:\d{2}:\d{2},\d{3}/.test(lines[0])){
            lines[0] = lines[0].replace(/,/g, '.'); // time format
            return lines.join('\n');
          }
          return '';
        }).filter(Boolean).join('\n\n');

      var blob = new Blob([vtt], { type: 'text/vtt' });
      var blobUrl = URL.createObjectURL(blob);
      var t = document.createElement('track');
      t.kind='subtitles'; t.label = lang || 'Subs'; t.srclang = lang || 'en'; t.src = blobUrl; t.default=true;
      video.appendChild(t);
    }).catch(function(){
      console.warn('Failed to load subtitles:', subUrl);
    });
  }

  // set initial quality & subs
  var preferQuality = qualitySelect.value || Object.keys(movie.sources)[0];
  setSourceForQuality(preferQuality);
  if (movie.subtitles && Object.keys(movie.subtitles).length){
    // add options already added; default to first subtitle if present
    var first = Object.keys(movie.subtitles)[0];
    if (first) {
      subsSelect.value = first;
      attachSubtitle(movie.subtitles[first], first);
    }
  }

  // update time & seek
  video.addEventListener('loadedmetadata', function(){
    seek.max = 100;
    durTime.textContent = formatTime(video.duration);
    // try resume position
    try {
      var p = JSON.parse(localStorage.getItem('nm_progress') || '{}');
      var pos = p[movie.id];
      if (pos && !isNaN(pos)){
        // pos stored in seconds or ms? we store seconds below. safe guard:
        var seconds = (pos > 100000) ? (pos/1000) : pos;
        video.currentTime = Math.min(video.duration - 2, seconds);
      }
    } catch(e){}
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
    else { video.pause(); btnPlay.textContent='▶'; btnPlaySmall.textContent='▶'; }
  }
  btnPlay && btnPlay.addEventListener('click', togglePlay);
  btnPlaySmall && btnPlaySmall.addEventListener('click', togglePlay);
  video.addEventListener('play', function(){ btnPlay.textContent='⏸'; btnPlaySmall.textContent='⏸'; });
  video.addEventListener('pause', function(){ btnPlay.textContent='▶'; btnPlaySmall.textContent='▶'; });

  // rewind/forward
  btnRew && btnRew.addEventListener('click', function(){ video.currentTime = Math.max(0, video.currentTime - 10); });
  btnFwd && btnFwd.addEventListener('click', function(){ video.currentTime = Math.min(video.duration, video.currentTime + 10); });

  // close button returns to home
  btnClose && btnClose.addEventListener('click', function(){ window.location = 'index.html'; });

  // quality switch
  qualitySelect && qualitySelect.addEventListener('change', function(){
    var quality = this.value;
    var chosen = movie.sources[quality];
    if (!chosen) return;
    var cur = video.currentTime;
    var isPlaying = !video.paused && !video.ended;
    video.pause();
    setSourceForQuality(quality);
    video.addEventListener('loadedmetadata', function once(){ video.currentTime = cur; if (isPlaying) { var p = video.play(); if (p && p.catch) p.catch(function(){}); } video.removeEventListener('loadedmetadata', once); });
  });

  // subtitles toggle
  subsSelect && subsSelect.addEventListener('change', function(){
    var val = this.value;
    if (val === 'off'){ attachSubtitle(null); return; }
    var subUrl = movie.subtitles[val];
    attachSubtitle(subUrl, val);
  });

  // speed
  speedSelect && speedSelect.addEventListener('change', function(){ video.playbackRate = parseFloat(this.value || 1); });

  // fullscreen
  btnFull && btnFull.addEventListener('click', function(){
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

  // resume: store progress in localStorage
  var storageKey = 'nm_progress';
  var saveInterval = null;
  video.addEventListener('play', function(){
    if (saveInterval) clearInterval(saveInterval);
    saveInterval = setInterval(function(){
      try {
        var p = JSON.parse(localStorage.getItem(storageKey) || '{}');
        p[movie.id] = Math.floor(video.currentTime); // seconds
        localStorage.setItem(storageKey, JSON.stringify(p));
      } catch(e){}
    }, 5000);
  });
  video.addEventListener('pause', function(){ if (saveInterval) clearInterval(saveInterval); });

  // preload: set poster for background small UI
  document.addEventListener('DOMContentLoaded', function(){
    try { if (movie.poster) document.body.style.backgroundImage = 'none'; } catch(e){}
  });

})();