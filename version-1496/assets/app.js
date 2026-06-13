(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
        document.body.classList.toggle('menu-open', panel.classList.contains('is-open'));
      });
    }

    all('[data-hero]').forEach(function (hero) {
      var slides = all('[data-hero-slide]', hero);
      var dots = all('[data-hero-dot]', hero);
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    all('[data-filter-panel]').forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var select = panel.querySelector('[data-filter-select="type"]');
      var grid = document.querySelector('[data-filter-grid]');
      var empty = null;

      if (!grid) {
        return;
      }

      function valueOf(card) {
        return [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
      }

      function ensureEmpty() {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'empty-state';
          empty.textContent = '没有找到匹配的影片。';
          grid.appendChild(empty);
        }
      }

      function filter() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var type = select ? select.value.trim() : '';
        var visible = 0;

        all('.movie-card', grid).forEach(function (card) {
          var text = valueOf(card);
          var typeText = card.getAttribute('data-type') || '';
          var matched = (!query || text.indexOf(query) !== -1) && (!type || typeText.indexOf(type) !== -1);
          card.classList.toggle('is-filtered-out', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (visible === 0) {
          ensureEmpty();
          empty.style.display = '';
        } else if (empty) {
          empty.style.display = 'none';
        }
      }

      if (input) {
        input.addEventListener('input', filter);
      }

      if (select) {
        select.addEventListener('change', filter);
      }
    });
  });
})();
