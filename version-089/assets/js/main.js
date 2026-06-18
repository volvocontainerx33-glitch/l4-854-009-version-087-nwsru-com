(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var siteNav = document.querySelector('[data-site-nav]');

  if (menuButton && siteNav) {
    menuButton.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function setSlide(nextIndex) {
      activeIndex = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === activeIndex);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === activeIndex);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        setSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    if (slides.length > 1) {
      startHero();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function bindCardFilter(scope) {
    var searchInput = scope.querySelector('[data-card-search]');
    var select = scope.querySelector('[data-card-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    if (!searchInput && !select) {
      return;
    }

    function applyFilter() {
      var query = normalize(searchInput ? searchInput.value : '');
      var selectedType = normalize(select ? select.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category')
        ].join(' '));
        var typeValue = normalize(card.getAttribute('data-type'));
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedType = !selectedType || typeValue.indexOf(selectedType) !== -1;
        card.classList.toggle('is-hidden', !(matchedQuery && matchedType));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }
    if (select) {
      select.addEventListener('change', applyFilter);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(bindCardFilter);

  var globalInput = document.getElementById('global-search-input');
  var globalButton = document.getElementById('global-search-button');
  var globalResults = document.getElementById('search-results');

  function renderGlobalResults() {
    if (!globalResults || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var query = normalize(globalInput ? globalInput.value : '');
    var data = window.MOVIE_SEARCH_DATA.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine,
        movie.category
      ].join(' '));
      return !query || haystack.indexOf(query) !== -1;
    }).slice(0, 80);

    if (!data.length) {
      globalResults.innerHTML = '<div class="empty-state">没有匹配的影片，请尝试更换关键词。</div>';
      return;
    }

    globalResults.innerHTML = data.map(function (movie) {
      var title = escapeHtml(movie.title);
      var oneLine = escapeHtml(movie.oneLine);
      var year = escapeHtml(movie.year);
      var type = escapeHtml(movie.type);
      var category = escapeHtml(movie.category);
      var genre = escapeHtml(movie.genre);

      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="' + movie.url + '">',
        '    <img src="' + movie.cover + '" alt="' + title + '" loading="lazy">',
        '    <span class="poster-shade"></span>',
        '    <span class="play-badge">▶</span>',
        '    <span class="poster-meta">' + year + ' · ' + type + '</span>',
        '  </a>',
        '  <div class="movie-info">',
        '    <h3><a href="' + movie.url + '">' + title + '</a></h3>',
        '    <p>' + oneLine + '</p>',
        '    <div class="tag-row"><span>' + category + '</span><span>' + genre + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  if (globalInput && globalResults) {
    globalInput.addEventListener('input', renderGlobalResults);
    if (globalButton) {
      globalButton.addEventListener('click', renderGlobalResults);
    }
    renderGlobalResults();
  }
})();
