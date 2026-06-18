(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    var showSlide = function (nextIndex) {
      index = nextIndex % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  var applySearch = function (value) {
    var query = String(value || '').trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = String(card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      var matched = !query || haystack.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  };

  if (searchInputs.length) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    searchInputs.forEach(function (input) {
      if (initial) {
        input.value = initial;
      }

      input.addEventListener('input', function () {
        searchInputs.forEach(function (other) {
          if (other !== input) {
            other.value = input.value;
          }
        });
        applySearch(input.value);
      });
    });

    applySearch(initial);
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-player-cover]');
    var button = player.querySelector('[data-player-start]');
    var hlsUrl = player.getAttribute('data-hls');
    var ready = false;
    var hlsInstance = null;

    var prepare = function () {
      if (!video || !hlsUrl || ready) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(hlsUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = hlsUrl;
      }
    };

    var start = function () {
      prepare();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video) {
        video.setAttribute('controls', 'controls');
        var playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
