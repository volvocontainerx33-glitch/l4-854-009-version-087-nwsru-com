(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initFilters() {
    var blocks = document.querySelectorAll('[data-filter-block]');
    blocks.forEach(function (block) {
      var input = block.querySelector('[data-filter-input]');
      var type = block.querySelector('[data-filter-type]');
      var year = block.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(block.querySelectorAll('[data-card]'));
      function apply() {
        var q = normalize(input ? input.value : '');
        var t = normalize(type ? type.value : '');
        var y = normalize(year ? year.value : '');
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' '));
          var ok = (!q || text.indexOf(q) !== -1) && (!t || normalize(card.getAttribute('data-type')) === t) && (!y || normalize(card.getAttribute('data-year')) === y);
          card.classList.toggle('hidden-card', !ok);
        });
      }
      [input, type, year].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });
    });
  }

  function initSearch() {
    var page = document.querySelector('[data-search-page]');
    if (!page || !window.SITE_MOVIES) {
      return;
    }
    var form = page.querySelector('[data-search-form]');
    var input = page.querySelector('[data-search-input]');
    var results = page.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    function render(query) {
      var q = normalize(query);
      results.innerHTML = '';
      if (!q) {
        results.innerHTML = '<div class="panel empty-state">输入影片名称、地区、题材或标签即可搜索片库。</div>';
        return;
      }
      var matched = window.SITE_MOVIES.filter(function (movie) {
        return normalize([movie.title, movie.region, movie.type, movie.year, movie.category, movie.tags, movie.desc].join(' ')).indexOf(q) !== -1;
      }).slice(0, 120);
      if (!matched.length) {
        results.innerHTML = '<div class="panel empty-state">暂无匹配内容，可以更换关键词继续搜索。</div>';
        return;
      }
      var html = '<div class="media-list">' + matched.map(function (movie) {
        return '<a class="media-row" href="' + movie.url + '">' +
          '<div class="poster-frame poster-thumb" data-title="' + escapeHtml(movie.title) + '">' +
          '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.remove()">' +
          '</div>' +
          '<div class="media-row-body">' +
          '<h3>' + escapeHtml(movie.title) + '</h3>' +
          '<p>' + escapeHtml(movie.desc) + '</p>' +
          '<div class="meta-line">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</div>' +
          '</div>' +
          '</a>';
      }).join('') + '</div>';
      results.innerHTML = html;
    }
    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      history.replaceState(null, '', query ? '?q=' + encodeURIComponent(query) : 'search.html');
      render(query);
    });
    render(initial);
  }

  function initPlayers() {
    var shells = document.querySelectorAll('[data-video-player]');
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      var src = shell.getAttribute('data-video-src');
      var hlsInstance = null;
      function attach() {
        if (!video || !src || video.getAttribute('data-ready') === '1') {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }
        video.setAttribute('data-ready', '1');
      }
      function play() {
        attach();
        if (video.paused) {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {});
          }
        } else {
          video.pause();
        }
      }
      if (button) {
        button.addEventListener('click', function (event) {
          event.stopPropagation();
          play();
        });
      }
      shell.addEventListener('click', function (event) {
        if (event.target.closest('button')) {
          return;
        }
        play();
      });
      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
      attach();
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearch();
    initPlayers();
  });
}());
