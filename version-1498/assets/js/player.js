function initMoviePlayer(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var button = document.querySelector("[data-player-start]");
    var hlsInstance = null;
    var loaded = false;

    if (!video || !streamUrl) {
        return;
    }

    function loadVideo() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function startPlayback() {
        loadVideo();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        video.controls = true;

        var request = video.play();

        if (request && typeof request.catch === "function") {
            request.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    if (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            startPlayback();
        });
    }

    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            startPlayback();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
