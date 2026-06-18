(function () {
  var shell = document.querySelector('[data-player-shell]');
  var video = document.getElementById('movie-video');
  var button = document.querySelector('[data-player-button]');

  if (!shell || !video || !button) {
    return;
  }

  var source = video.getAttribute('data-src');
  var hlsInstance = null;

  function playVideo() {
    if (!source) {
      return;
    }

    button.classList.add('is-hidden');

    if (window.Hls && window.Hls.isSupported()) {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          button.classList.remove('is-hidden');
        });
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          video.src = source;
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
      video.src = source;
      video.play().catch(function () {
        button.classList.remove('is-hidden');
      });
      return;
    }

    video.src = source;
    video.play().catch(function () {
      button.classList.remove('is-hidden');
    });
  }

  button.addEventListener('click', playVideo);
  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove('is-hidden');
    }
  });
})();
