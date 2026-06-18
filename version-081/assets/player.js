
(function () {
  function setupPlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var button = wrapper.querySelector('.play-trigger');
    var streamUrl = wrapper.getAttribute('data-stream');
    var loaded = false;
    var hls = null;

    function loadStream() {
      if (loaded || !video || !streamUrl) {
        return Promise.resolve();
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          window.setTimeout(resolve, 900);
        });
      }
      video.src = streamUrl;
      return Promise.resolve();
    }

    function startPlayback() {
      wrapper.classList.add('is-started');
      loadStream().then(function () {
        var playRequest = video.play();
        if (playRequest && typeof playRequest.catch === 'function') {
          playRequest.catch(function () {
            wrapper.classList.remove('is-started');
          });
        }
      }).catch(function () {
        wrapper.classList.remove('is-started');
      });
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    wrapper.addEventListener('click', function (event) {
      if (wrapper.classList.contains('is-started')) {
        return;
      }
      if (event.target === video) {
        startPlayback();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(setupPlayer);
  });
})();
