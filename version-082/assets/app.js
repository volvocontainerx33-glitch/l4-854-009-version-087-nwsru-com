
(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMenu() {
        var button = qs('[data-menu-button]');
        var menu = qs('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('.hero-slide', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var dotsBox = qs('[data-hero-dots]', hero);
        var active = 0;
        var timer = null;

        function render() {
            slides.forEach(function (slide, index) {
                slide.classList.toggle('is-active', index === active);
            });
            if (dotsBox) {
                qsa('button', dotsBox).forEach(function (dot, index) {
                    dot.classList.toggle('is-active', index === active);
                });
            }
        }

        function go(offset) {
            active = (active + offset + slides.length) % slides.length;
            render();
        }

        if (dotsBox) {
            slides.forEach(function (_, index) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换到第' + (index + 1) + '部');
                dot.addEventListener('click', function () {
                    active = index;
                    render();
                    restart();
                });
                dotsBox.appendChild(dot);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                go(-1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                go(1);
                restart();
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                go(1);
            }, 5200);
        }

        render();
        restart();
    }

    function setupFilters() {
        qsa('[data-filter-panel]').forEach(function (panel) {
            var section = panel.closest('section') || document;
            var cards = qsa('.searchable-card', section);
            var empty = qs('[data-empty-state]', section);
            var search = qs('[data-card-search]', panel);
            var category = qs('[data-card-category]', panel);
            var year = qs('[data-card-year]', panel);
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q');

            if (initialQuery && search) {
                search.value = initialQuery;
            }

            function apply() {
                var text = normalize(search && search.value);
                var cat = category ? category.value : 'all';
                var yearValue = normalize(year && year.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.category,
                        card.dataset.year,
                        card.dataset.tags
                    ].join(' '));
                    var matchesText = !text || haystack.indexOf(text) !== -1;
                    var matchesCategory = cat === 'all' || card.dataset.category === cat;
                    var matchesYear = !yearValue || normalize(card.dataset.year).indexOf(yearValue) !== -1;
                    var show = matchesText && matchesCategory && matchesYear;
                    card.style.display = show ? '' : 'none';
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [search, category, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    window.setupMoviePlayer = function (videoId, overlayId, buttonId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var label = document.getElementById(buttonId);
        var hlsInstance = null;
        var ready = false;

        if (!video || !overlay || !source) {
            return;
        }

        function load() {
            if (ready) {
                return Promise.resolve();
            }
            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return Promise.resolve();
            }

            video.src = source;
            return Promise.resolve();
        }

        function play() {
            if (label) {
                label.textContent = '加载中';
            }
            load().then(function () {
                overlay.classList.add('is-hidden');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        overlay.classList.remove('is-hidden');
                        if (label) {
                            label.textContent = '立即播放';
                        }
                    });
                }
            });
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                overlay.classList.remove('is-hidden');
                if (label) {
                    label.textContent = '继续播放';
                }
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
