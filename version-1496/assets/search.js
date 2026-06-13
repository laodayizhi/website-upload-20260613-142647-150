(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a href="./' + escapeHtml(movie.file) + '" class="card-cover" aria-label="' + escapeHtml(movie.title) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="play-chip">播放</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<div class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + '</div>' +
      '<h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function searchable(movie) {
    return [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      (movie.tags || []).join(' '),
      movie.oneLine
    ].join(' ').toLowerCase();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('site-search-input');
    var results = document.getElementById('search-results');
    var form = document.querySelector('.search-page-form');
    var buttons = document.querySelectorAll('[data-query]');
    var movies = window.SEARCH_MOVIES || [];

    function render(query) {
      var keyword = String(query || '').trim().toLowerCase();
      var matched = movies.filter(function (movie) {
        return !keyword || searchable(movie).indexOf(keyword) !== -1;
      }).slice(0, 120);

      if (results) {
        results.innerHTML = matched.length ? matched.map(card).join('') : '<div class="empty-state">没有找到匹配的影片。</div>';
      }
    }

    if (input) {
      input.value = params().get('q') || '';
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var url = new URL(window.location.href);
        url.searchParams.set('q', input ? input.value.trim() : '');
        window.history.replaceState({}, '', url.toString());
        render(input ? input.value : '');
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        if (input) {
          input.value = button.getAttribute('data-query') || '';
          render(input.value);
        }
      });
    });

    render(input ? input.value : '');
  });
})();
