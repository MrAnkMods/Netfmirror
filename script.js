/* script.js - populates home, handles details linking and splash */
(function(){
  // helper DOM
  var content = document.getElementById('content');
  var yearEls = document.querySelectorAll('#year, #year2');
  yearEls.forEach(function(e){ e.textContent = new Date().getFullYear(); });

  // build rows
  function makeRow(title, items){
    var row = document.createElement('section');
    row.className = 'row';
    row.innerHTML = '<h2>' + title + '</h2><div class="row-posters"></div>';
    var wrap = row.querySelector('.row-posters');
    items.forEach(function(m){
      var card = document.createElement('div');
      card.className = 'poster-card';
      card.innerHTML = '<img src="'+(m.poster || 'assets/poster1.jpg')+'" alt="'+m.title+'"><div class="poster-title">'+m.title+'</div>';
      card.addEventListener('click', function(){ openDetails(m.id); });
      wrap.appendChild(card);
    });
    return row;
  }

  // show categories
  function renderHome(){
    content.innerHTML = '';
    var trending = movies.slice(0,6);
    content.appendChild(makeRow('Trending Now', trending));
    content.appendChild(makeRow('Top Picks', movies));
    content.appendChild(makeRow('Action', movies));
    content.appendChild(makeRow('Drama', movies));
  }

  // search
  document.getElementById('btnSearch').addEventListener('click', function(){
    var q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
    if (!q){ renderHome(); return; }
    var results = movies.filter(function(m){ return (m.title + ' ' + (m.description||'')).toLowerCase().indexOf(q) !== -1; });
    content.innerHTML = '';
    content.appendChild(makeRow('Search results for "'+q+'"', results));
  });

  // details
  function openDetails(id){
    // set location with query so details.html can parse
    window.location = 'details.html?id=' + encodeURIComponent(id);
  }

  // initial render
  renderHome();

  /* SPLASH LOGIC (if present) */
  try {
    var splash = document.getElementById('splash');
    if (splash){
      document.body.classList.add('preload');
      var bar = document.getElementById('splashBar');
      var text = document.getElementById('splashText');
      var progress = 0;
      var fakeInterval = setInterval(function(){
        if (progress < 85) { progress += Math.random()*6; if (progress>85) progress=85; bar.style.width = Math.floor(progress)+'%'; }
      }, 180);
      window.addEventListener('load', function(){
        clearInterval(fakeInterval);
        var finalize = setInterval(function(){
          progress += 6 + Math.random()*8;
          if (progress >= 100) progress = 100;
          bar.style.width = progress + '%';
          text.textContent = (progress < 100) ? 'Loading… ' + Math.floor(progress) + '%' : 'Almost there…';
          if (progress >= 100){
            clearInterval(finalize);
            setTimeout(hideSplash, 300);
          }
        }, 120);
      });
      setTimeout(function(){ if (!splash.classList.contains('splash-hidden')) hideSplash(); }, 9000);
      function hideSplash(){
        document.body.classList.remove('preload');
        splash.classList.add('splash-hidden');
        setTimeout(function(){ try{ splash.parentNode && splash.parentNode.removeChild(splash); }catch(e){} }, 800);
      }
    }
  } catch(e){ console.error(e); }
})();