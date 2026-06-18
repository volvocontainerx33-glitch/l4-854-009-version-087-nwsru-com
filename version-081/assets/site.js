
(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    if (!slides.length) {
      return;
    }
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  function setupPageFilters() {
    var cardLists = selectAll('[data-card-list]');
    if (!cardLists.length) {
      return;
    }

    cardLists.forEach(function (list) {
      var scope = list.closest('main') || document;
      var searchInput = scope.querySelector('[data-page-search]');
      var chips = selectAll('[data-filter-value]', scope);
      var empty = scope.querySelector('[data-empty-state]');
      var activeType = '全部';

      function cardMatches(card, query) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type')
        ].join(' ').toLowerCase();
        var type = card.getAttribute('data-type') || '';
        var byType = activeType === '全部' || type === activeType;
        var byQuery = !query || text.indexOf(query) !== -1;
        return byType && byQuery;
      }

      function applyFilters() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var visible = 0;
        selectAll('.searchable-card', list).forEach(function (card) {
          var matched = cardMatches(card, query);
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          activeType = chip.getAttribute('data-filter-value') || '全部';
          chips.forEach(function (otherChip) {
            otherChip.classList.toggle('is-active', otherChip === chip);
          });
          applyFilters();
        });
      });

      applyFilters();
    });
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupGlobalSearch() {
    var form = document.querySelector('[data-global-search-form]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    if (!form || !results || !summary || !window.siteMovies) {
      return;
    }
    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function search(query) {
      query = query.trim().toLowerCase();
      if (!query) {
        results.innerHTML = '';
        summary.textContent = '输入关键词开始搜索';
        return;
      }
      var matched = window.siteMovies.filter(function (movie) {
        var text = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return text.indexOf(query) !== -1;
      }).slice(0, 80);
      summary.textContent = '找到 ' + matched.length + ' 个结果';
      results.innerHTML = matched.map(movieCardTemplate).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var target = window.location.pathname + (query ? '?q=' + encodeURIComponent(query) : '');
      window.history.replaceState({}, '', target);
      search(query);
    });

    input.addEventListener('input', function () {
      search(input.value);
    });

    search(initialQuery);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHeroSlider();
    setupPageFilters();
    setupGlobalSearch();
  });
})();
