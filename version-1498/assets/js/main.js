document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    var searchInputs = document.querySelectorAll("input[type='search']");

    searchInputs.forEach(function (input) {
        if (keyword && !input.value) {
            input.value = keyword;
        }
    });

    var pageSearch = document.querySelector("[data-page-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-list] .movie-card"));
    var empty = document.querySelector("[data-search-empty]");

    function filterCards(value) {
        var term = String(value || "").trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = String(card.getAttribute("data-search") || "").toLowerCase();
            var matched = term === "" || haystack.indexOf(term) !== -1;
            card.classList.toggle("is-hidden", !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    if (pageSearch) {
        pageSearch.value = keyword;
        filterCards(keyword);
        pageSearch.addEventListener("input", function () {
            filterCards(pageSearch.value);
        });
    } else if (keyword && cards.length) {
        filterCards(keyword);
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }
    }
});
