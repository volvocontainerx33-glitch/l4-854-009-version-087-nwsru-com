(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    document.querySelectorAll("[data-nav-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var panel = document.querySelector("[data-mobile-panel]");
        if (panel) {
          panel.classList.toggle("is-open");
        }
      });
    });

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer = null;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-section]").forEach(function (section) {
      var input = section.querySelector("[data-filter-input]");
      var year = section.querySelector("[data-filter-year]");
      var type = section.querySelector("[data-filter-type]");
      var region = section.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));

      function applyQueryParam() {
        if (!section.hasAttribute("data-query-page") || !input) {
          return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
          input.value = q;
        }
      }

      function filterCards() {
        var term = normalize(input && input.value);
        var y = normalize(year && year.value);
        var t = normalize(type && type.value);
        var r = normalize(region && region.value);

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-keywords"));
          var cy = normalize(card.getAttribute("data-year"));
          var ct = normalize(card.getAttribute("data-type"));
          var cr = normalize(card.getAttribute("data-region"));
          var ok = true;
          if (term && text.indexOf(term) === -1) {
            ok = false;
          }
          if (y && cy !== y) {
            ok = false;
          }
          if (t && ct !== t) {
            ok = false;
          }
          if (r && cr !== r) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
        });
      }

      [input, year, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filterCards);
          control.addEventListener("change", filterCards);
        }
      });

      applyQueryParam();
      filterCards();
    });

    document.querySelectorAll("[data-video-player]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("button");
      var source = shell.getAttribute("data-m3u8");
      var hlsInstance = null;

      function bind() {
        if (!video || !source || video.dataset.ready === "1") {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        video.dataset.ready = "1";
      }

      function play() {
        bind();
        shell.classList.add("is-playing");
        if (video) {
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }

      shell.addEventListener("click", function (event) {
        if (event.target === video && video.dataset.ready === "1") {
          return;
        }
        play();
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  });
})();
