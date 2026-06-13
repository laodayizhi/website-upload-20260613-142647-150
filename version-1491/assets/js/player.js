(function () {
  function setupPlayer(player) {
    var video = player.querySelector("video");
    var startButton = player.querySelector(".video-start");
    var streamUrl = player.getAttribute("data-stream");
    var hls = null;
    var started = false;

    if (!video || !streamUrl) {
      return;
    }

    function hideButton() {
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
    }

    function showButton() {
      if (startButton) {
        startButton.classList.remove("is-hidden");
      }
    }

    function attachStream() {
      if (started) {
        return Promise.resolve();
      }

      started = true;
      hideButton();

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
            started = false;
            showButton();
          }
        });
      } else {
        video.src = streamUrl;
      }

      return video.play();
    }

    function startPlayback() {
      var attempt = attachStream();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          showButton();
        });
      }
    }

    if (startButton) {
      startButton.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (!started) {
        startPlayback();
      }
    });

    video.addEventListener("play", hideButton);
  }

  if (document.readyState !== "loading") {
    document.querySelectorAll(".movie-player").forEach(setupPlayer);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll(".movie-player").forEach(setupPlayer);
    });
  }
})();
