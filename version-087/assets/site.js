(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var links = document.querySelector("[data-nav-links]");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = selectAll(".hero-slide", root);
        var dots = selectAll("[data-hero-dot]", root);
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }

        show(0);
        play();
    }

    function matchesYear(card, year) {
        if (!year || year === "all") {
            return true;
        }
        return card.getAttribute("data-year") === year;
    }

    function setupFilters() {
        selectAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var cards = selectAll(".movie-card", scope);
            var buttons = selectAll("[data-filter-year]", scope);
            var activeYear = "all";

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    var visible = text.indexOf(keyword) !== -1 && matchesYear(card, activeYear);
                    card.style.display = visible ? "" : "none";
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeYear = button.getAttribute("data-filter-year") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-selected", item === button);
                    });
                    apply();
                });
            });
        });
    }

    window.setupMoviePlayer = function (source) {
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        if (!video || !source) {
            return;
        }
        var loaded = false;

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
