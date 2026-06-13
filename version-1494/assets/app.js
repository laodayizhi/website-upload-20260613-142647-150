(function () {
  var heroIndex = 0;
  var heroTimer = null;

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function bindHeaderSearch(form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[type="search"]');
      var value = input ? input.value.trim() : '';
      var url = 'all.html';
      if (value) {
        url += '?q=' + encodeURIComponent(value);
      }
      window.location.href = url;
    });
  }

  function initHeader() {
    selectAll('.site-search').forEach(bindHeaderSearch);
    var toggle = document.querySelector('.mobile-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function showHeroSlide(nextIndex) {
    var slides = selectAll('.hero-slide');
    var dots = selectAll('.hero-dot');
    if (!slides.length) {
      return;
    }
    heroIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, index) {
      slide.classList.toggle('is-active', index === heroIndex);
    });
    dots.forEach(function (dot, index) {
      dot.classList.toggle('is-active', index === heroIndex);
    });
  }

  function initHero() {
    var slides = selectAll('.hero-slide');
    if (!slides.length) {
      return;
    }
    selectAll('.hero-dot').forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHeroSlide(index);
        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(function () {
          showHeroSlide(heroIndex + 1);
        }, 6200);
      });
    });
    showHeroSlide(0);
    heroTimer = window.setInterval(function () {
      showHeroSlide(heroIndex + 1);
    }, 6200);
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().replace(/\s+/g, '');
  }

  function initFilters() {
    var grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }
    var cards = selectAll('.movie-card', grid);
    var input = document.querySelector('[data-filter-search]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedType = !type || card.getAttribute('data-type') === type;
        var matchedYear = !year || card.getAttribute('data-year') === year;
        var matched = matchedKeyword && matchedType && matchedYear;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
    applyFilter();
  }

  var hlsScriptReady = false;
  var hlsScriptLoading = false;
  var hlsCallbacks = [];

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    hlsCallbacks.push(callback);
    if (hlsScriptLoading) {
      return;
    }
    hlsScriptLoading = true;
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.onload = function () {
      hlsScriptReady = true;
      hlsCallbacks.splice(0).forEach(function (fn) {
        fn();
      });
    };
    script.onerror = function () {
      hlsCallbacks.splice(0).forEach(function (fn) {
        fn();
      });
    };
    document.head.appendChild(script);
  }

  window.initMoviePlayer = function (videoUrl) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playerOverlay');
    if (!video || !overlay || !videoUrl) {
      return;
    }
    var hlsInstance = null;
    var attached = false;

    function attachAndPlay() {
      if (attached) {
        video.play().catch(function () {});
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.play().catch(function () {});
        return;
      }
      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 45,
            enableWorker: true
          });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = videoUrl;
          video.play().catch(function () {});
        }
      });
    }

    function startPlayback() {
      overlay.classList.add('is-hidden');
      attachAndPlay();
    }

    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initHero();
    initFilters();
  });
})();
