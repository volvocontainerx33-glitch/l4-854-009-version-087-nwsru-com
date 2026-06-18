
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    var search = document.querySelector('.nav-search');

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
        if (search) {
          search.classList.toggle('open');
        }
      });
    }

    initHero();
    initCategoryFilter();
    initSearchPage();
    initPlayers();
  });

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }

    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    show(0);
    setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initCategoryFilter() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }

    var keyword = panel.querySelector('[data-filter-keyword]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var genre = panel.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var empty = document.querySelector('[data-empty]');

    function value(el) {
      return el ? String(el.value || '').trim().toLowerCase() : '';
    }

    function apply() {
      var kw = value(keyword);
      var yr = value(year);
      var rg = value(region);
      var gn = value(genre);
      var visible = 0;

      cards.forEach(function (card) {
        var hay = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var ok = true;

        if (kw && hay.indexOf(kw) === -1) {
          ok = false;
        }
        if (yr && String(card.getAttribute('data-year') || '') !== yr) {
          ok = false;
        }
        if (rg && String(card.getAttribute('data-region') || '') !== rg) {
          ok = false;
        }
        if (gn && String(card.getAttribute('data-genre') || '').indexOf(gn) === -1) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [keyword, year, region, genre].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });

    apply();
  }

  function initSearchPage() {
    var mount = document.querySelector('[data-search-results]');
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    if (!mount || !form || !input || !window.SEARCH_MOVIES) {
      return;
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[char];
      });
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var params = new URLSearchParams(window.location.search);
      if (!query && params.get('q')) {
        query = params.get('q').trim().toLowerCase();
        input.value = params.get('q');
      }

      if (!query) {
        mount.innerHTML = '<div class="notice-empty" style="display:block">输入关键词即可查找片名、地区、年份和题材。</div>';
        return;
      }

      var result = window.SEARCH_MOVIES.filter(function (item) {
        return [item.title, item.desc, item.genre, item.region, item.year, item.tags].join(' ').toLowerCase().indexOf(query) !== -1;
      }).slice(0, 120);

      if (!result.length) {
        mount.innerHTML = '<div class="notice-empty" style="display:block">没有找到匹配内容。</div>';
        return;
      }

      mount.innerHTML = '<div class="movie-grid three">' + result.map(function (item) {
        return [
          '<a class="movie-card compact-card" href="movie/movie-' + item.id + '.html">',
          '<div class="card-poster"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="card-type">' + escapeHtml(item.type) + '</span><span class="card-views">' + escapeHtml(item.year) + '</span></div>',
          '<div class="card-body"><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.desc) + '</p><div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div></div>',
          '</a>'
        ].join('');
      }).join('') + '</div>';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var params = new URLSearchParams(window.location.search);
      params.set('q', input.value.trim());
      window.history.replaceState(null, '', window.location.pathname + '?' + params.toString());
      render();
    });

    input.addEventListener('input', render);
    render();
  }

  function initPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-hls]'));
    videos.forEach(function (video) {
      var src = video.getAttribute('data-hls');
      var cover = video.closest('.video-box');
      var button = cover ? cover.querySelector('[data-play-button]') : null;
      var layer = cover ? cover.querySelector('.play-cover') : null;

      function markPlaying() {
        if (layer) {
          layer.classList.add('hidden');
        }
      }

      function markPaused() {
        if (layer && video.paused) {
          layer.classList.remove('hidden');
        }
      }

      if (src) {
        if (window.Hls && window.Hls.isSupported()) {
          var player = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          player.loadSource(src);
          player.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      if (button) {
        button.addEventListener('click', function () {
          video.play().then(markPlaying).catch(function () {
            markPaused();
          });
        });
      }

      video.addEventListener('play', markPlaying);
      video.addEventListener('pause', markPaused);
      video.addEventListener('ended', markPaused);
    });
  }
})();
