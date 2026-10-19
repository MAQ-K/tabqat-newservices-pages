(function ($) {
    "use strict";
    // Every plugin call below is guarded by "does the page have this markup / is the library loaded",
    // because tools/optimize-scripts.js only ships the plugins a page actually uses.
    var has = function (sel) { return document.querySelector(sel) !== null; };

    /* Windows load: preloader + WOW */
    $(window).on('load', function () {
        $("#pre-load").delay(600).fadeOut(500);
        $(".pre-loader").delay(600).fadeOut(500);
        if (window.WOW) {
            new WOW({ boxClass: 'wow', animateClass: 'animated', offset: 0, mobile: false, live: false }).init();
        }
    });

    /* footer year */
    var yearElement = document.getElementById("year");
    if (yearElement) { yearElement.innerHTML = new Date().getFullYear(); }

    /* Sidebar Toggle */
    $(".offcanvas-close,.offcanvas-overlay").on("click", function () {
        $(".offcanvas-area").removeClass("info-open");
        $(".offcanvas-overlay").removeClass("overlay-open");
    });
    $(".sidebar-toggle").on("click", function (e) {
        e.preventDefault();
        $(".offcanvas-area").addClass("info-open");
        $(".offcanvas-overlay").addClass("overlay-open");
    });
    $(".body-overlay").on("click", function () {
        $(".offcanvas-area").removeClass("opened");
        $(".body-overlay").removeClass("opened");
    });

    /* Data Css js */
    $("[data-background]").each(function () {
        $(this).css("background-image", "url( " + $(this).attr("data-background") + "  )");
    });
    $("[data-width]").each(function () { $(this).css("width", $(this).attr("data-width")); });
    $("[data-bg-color]").each(function () { $(this).css("background-color", $(this).attr("data-bg-color")); });

    /* MagnificPopup */
    if ($.fn.magnificPopup) {
        $(".popup-image").magnificPopup({ type: "image", gallery: { enabled: true } });
        $(".popup-video").magnificPopup({ type: "iframe" });
    }
    if (window.jarallax && has('.jarallax')) {
        jarallax(document.querySelectorAll('.jarallax'), { speed: 0.5 });
    }
    if ($.fn.niceSelect && has('select')) { $("select").niceSelect(); }
    if (window.PureCounter && has('.purecounter, .filesizecount')) {
        new PureCounter();
        new PureCounter({ filesizing: true, selector: ".filesizecount", pulse: 2 });
    }
    if ($.fn.appear && has('.odometer')) {
        $('.odometer').appear(function () {
            $(".odometer").each(function () { $(this).html($(this).attr("data-count")); });
        });
    }

    /* search */
    $('.rs-header-search-icon').on('click', function () {
        $('.rs-stickys-form').slideToggle('show');
        $(this).toggleClass('icon-close');
    });

    $(document).ready(function () {
        // button style
        $('.rs-button-wrapper .rs-btn').on('mouseenter', function () {
            $(this).find('.rs-icon').css('animation', 'btnHoverEffect 0.5s');
        }).on('mouseleave', function () {
            $(this).find('.rs-icon').css('animation', 'btnHoverEffectReverse 0.5s');
        });

        // circle text
        $(".rs-text-circle").each(function () {
            var sentence = $(this).text().replace(/\s+/g, ' ').trim();
            var wrapped = '';
            for (var i = 0; i < sentence.length; i++) { wrapped += '<span>' + sentence[i] + '</span>'; }
            $(this).html(wrapped);
            var deg = parseInt($(this).data("rotate-degree"), 10) || 20;
            $(this).find("span").each(function (index) {
                $(this).css("transform", "rotate(" + ((index + 1) * deg) + "deg)");
            });
        });

        // Swiper sliders
        if (window.Swiper) {
            $('.rs-swiper .swiper').each(function (index) {
                var $s = $(this);
                var d = function (k, dflt) { var v = $s.data(k); return v === undefined ? dflt : v; };
                var hoverAutoplay = d('hover-pause', true);
                var slidesPerView = $s.data('item');
                var gap = ($s.data('no-gap') === true) ? 0 : 30;
                var margin = $s.data('margin') ? $s.data('margin') : gap;
                var marginXl = $s.data('margin-xl') ? $s.data('margin-xl') : margin;
                var marginLg = $s.data('margin-lg') ? $s.data('margin-lg') : marginXl;
                var marginMd = $s.data('margin-md') ? $s.data('margin-md') : marginLg;
                var marginSm = $s.data('margin-sm') ? $s.data('margin-sm') : marginMd;
                var marginXs = $s.data('margin-xs') ? $s.data('margin-xs') : marginSm;
                var marginMobile = $s.data('margin-mobile') ? $s.data('margin-mobile') : marginXs;
                var rsNavPrev = 'rs-nav-prev-' + index, rsNavNext = 'rs-nav-next-' + index, rsPagination = 'rs-pagination-' + index;
                $s.closest('.rs-swiper').find('.swiper-button-prev').addClass(rsNavPrev);
                $s.closest('.rs-swiper').find('.swiper-button-next').addClass(rsNavNext);
                $s.closest('.rs-swiper').find('.swiper-pagination').addClass(rsPagination);
                var per = function (k) { return $s.data(k) ? $s.data(k) : 1; };
                var swiper = new Swiper(this, {
                    loop: d('loop', true),
                    autoplay: d('autoplay', true),
                    direction: $s.data('direction') === 'vertical' ? 'vertical' : 'horizontal',
                    effect: $s.data('effect') || 'slide',
                    fadeEffect: { crossFade: true },
                    enabled: d('play-slide', true),
                    grabCursor: d('grab-cursor', false),
                    oneWayMovement: d('one-way', false),
                    centeredSlides: d('center-mode', false),
                    initialSlide: ($s.data('start-at') ? $s.data('start-at') : 0),
                    slidesPerView: (slidesPerView ? slidesPerView : 1),
                    spaceBetween: margin,
                    speed: ($s.data('speed') ? $s.data('speed') : 500),
                    pagination: { el: '.' + rsPagination, dynamicBullets: d('dots-dynamic', true), clickable: true },
                    navigation: { nextEl: '.' + rsNavPrev, prevEl: '.' + rsNavNext },
                    breakpoints: {
                        10: { slidesPerView: per('item-mobile'), spaceBetween: marginMobile },
                        481: { slidesPerView: per('item-xs'), spaceBetween: marginXs },
                        576: { slidesPerView: per('item-sm'), spaceBetween: marginSm },
                        768: { slidesPerView: per('item-md'), spaceBetween: marginMd },
                        992: { slidesPerView: per('item-lg'), spaceBetween: marginLg },
                        1025: { slidesPerView: per('item-xl'), spaceBetween: marginXl },
                        1201: { slidesPerView: (slidesPerView ? slidesPerView : 1), spaceBetween: margin }
                    }
                });
                if (hoverAutoplay) {
                    $s.on('mouseenter', function () { swiper.autoplay.stop(); })
                      .on('mouseleave', function () { swiper.autoplay.start(); });
                }
            });

            if (has('.product-details-nav')) {
                var productDetails = new Swiper(".product-details-nav", {
                    spaceBetween: -20, slidesPerView: 4,
                    navigation: { nextEl: ".product-details-button-next", prevEl: ".product-details-button-prev" }
                });
                new Swiper(".product-details-active", {
                    spaceBetween: 0, thumbs: { swiper: productDetails },
                    navigation: { nextEl: ".product-details-button-next", prevEl: ".product-details-button-prev" }
                });
            }
            if (has('.rs-marquee-slide')) {
                new Swiper('.rs-marquee-slide', {
                    spaceBetween: 0, centeredSlides: true, speed: 10000, autoplay: { delay: 1 },
                    loop: true, slidesPerView: 'auto', allowTouchMove: false, disableOnInteraction: true
                });
            }
            if (has('.text-slide-one')) {
                new Swiper(".text-slide-one", {
                    loop: true, freemode: true, slidesPerView: 4, spaceBetween: 0, allowTouchMove: false,
                    speed: 10000, autoplay: { delay: 1, disableOnInteraction: true }
                });
            }
        }

        /* Back to top + sticky header: one passive, rAF-throttled scroll handler, no forced layout per event */
        var wrap = document.querySelector(".backtotop-wrap");
        var progressPath = wrap && wrap.querySelector("path");
        var pathLength = 0, docMax = 1, ticking = false;
        var header = document.getElementById("header-sticky");
        if (progressPath) {
            pathLength = progressPath.getTotalLength();
            progressPath.style.transition = "none";
            progressPath.style.strokeDasharray = pathLength + " " + pathLength;
            progressPath.style.strokeDashoffset = pathLength;
            progressPath.getBoundingClientRect();
            progressPath.style.transition = "stroke-dashoffset 10ms linear";
        }
        function measure() { docMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }
        function paint() {
            ticking = false;
            var y = window.pageYOffset;
            if (progressPath) { progressPath.style.strokeDashoffset = pathLength - (y * pathLength) / docMax; }
            if (wrap) { wrap.classList.toggle("active-progress", y > 150); }
            if (header) { header.classList.toggle("rs-sticky", y > 250); }
        }
        if (progressPath || header) {
            measure(); paint();
            window.addEventListener("scroll", function () {
                if (!ticking) { ticking = true; requestAnimationFrame(paint); }
            }, { passive: true });
            window.addEventListener("resize", function () { measure(); paint(); }, { passive: true });
            window.addEventListener("load", measure);
        }
        $(".backtotop-wrap").on("click", function (event) {
            event.preventDefault();
            $("html, body").animate({ scrollTop: 0 }, 550);
            return false;
        });

        /* price slider */
        if (window.noUiSlider && document.getElementById('slider-range')) {
            var slider1 = document.getElementById('slider-range');
            noUiSlider.create(slider1, { start: [0, 1100], connect: true, range: { 'min': 0, 'max': 2500 } });
            var amount1 = document.getElementById('amount');
            slider1.noUiSlider.on('update', function (values) { amount1.value = "$" + values[0] + " - $" + values[1]; });
            $('#filter-btn').on('click', function () { $('.filter-widget').slideToggle(1000); });
        }

        /* hotspots + ripple rotation (only where that markup exists) */
        if (has('.rs-ripple-item')) {
            jQuery('.rs-ripple-item').each(function (index) {
                jQuery(this).addClass('rs-ripple-item-' + index);
                var parentHotspots = jQuery(this).closest('.rs-contact-wrapper');
                var targetMobileItem = parentHotspots.find('.mobile_item').eq(index);
                jQuery(this).on('click', function () {
                    if (targetMobileItem.hasClass('active')) {
                        targetMobileItem.removeClass('active');
                    } else {
                        parentHotspots.find('.mobile_item.active').removeClass('active');
                        targetMobileItem.addClass('active');
                    }
                });
                parentHotspots.on('click', '.remove-icon', function (event) {
                    event.stopPropagation();
                    targetMobileItem.removeClass('active');
                });
            });
            var switches = jQuery('.rs-contact-wrapper .rs-ripple-item'), currentIndex = 0, rippleTimer;
            var startRotation = function () {
                rippleTimer = setInterval(function () {
                    switches.eq(currentIndex).removeClass('ripple');
                    currentIndex = (currentIndex + 1) % switches.length;
                    switches.eq(currentIndex).addClass('ripple');
                }, 1500);
            };
            var stopRotation = function () { clearInterval(rippleTimer); switches.eq(currentIndex).removeClass('ripple'); };
            if (switches.length) {
                startRotation();
                switches.on('mouseenter', stopRotation).on('mouseleave', startRotation);
            }
        }

        // Menu Active
        var currentPath = window.location.pathname.split('/').pop();
        document.querySelectorAll('.multipage-menu a').forEach(function (link) {
            var linkPath = link.getAttribute('href');
            if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
                link.classList.add('active');
                for (var li = link.parentElement; li; li = li.parentElement) {
                    if (li.tagName === 'LI') { li.classList.add('active'); }
                }
            }
        });

        /* Mobile Menu */
        if ($.fn.meanmenu) {
            $("#mobile-menu").meanmenu({
                meanMenuContainer: ".mobile-menu",
                meanScreenWidth: "1199",
                meanExpand: ['<i class="fa-regular fa-plus"></i>'],
            });
        }

        $(".onepage-menu li a").on('click', function () {
            $(".onepage-menu li a.active").removeClass("active");
            $(this).addClass("active");
            $(".offcanvas-area").removeClass("info-open");
            $(".offcanvas-overlay").removeClass("overlay-open");
        });

        // Tab Auto Switcher (home page)
        var $tabs = $('.rs-services-tab-wrapper.auto-switch');
        if ($tabs.length) {
            var autoSwitchTimer;
            var switchTabs = function () {
                var $next = $tabs.find('.nav-item .nav-link.active').closest('.nav-item').next('.nav-item').find('.nav-link');
                if (!$next.length) { $next = $tabs.find('.nav-item').first().find('.nav-link'); }
                $next.trigger('click');
            };
            var startAutoSwitch = function () { autoSwitchTimer = setInterval(switchTabs, 5000); };
            startAutoSwitch();
            $tabs.on('mouseenter', function () { clearInterval(autoSwitchTimer); }).on('mouseleave', startAutoSwitch);
        }
    });

    /* parallax image */
    if (window.Parallax && has('.prallax-parent')) {
        $(".prallax-parent").each(function () { new Parallax(this); });
    }

    /* portfolio isotope */
    if ($.fn.isotope && $.fn.imagesLoaded && has('.grid')) {
        if (has('.portfolio-load-more')) {
            $('.grid').imagesLoaded(function () {
                var $grid = $('.grid').isotope({ itemSelector: '.grid-item', percentPosition: true, masonry: { columnWidth: '.grid-item' } });
                $('.rs-portfolio-tab').on('click', 'button', function () {
                    $grid.isotope({ filter: $(this).attr('data-filter') });
                });
                $('.rs-portfolio-tab button').on('click', function (event) {
                    $(this).siblings('.active').removeClass('active');
                    $(this).addClass('active');
                    event.preventDefault();
                });
                var show_item = $('.portfolio-load-more').attr('data-show');
                var isotop_call = $grid.data('isotope');
                var loadMore = function (showing) {
                    $grid.find(".hidden").removeClass("hidden");
                    var hidden = isotop_call.filteredItems.slice(showing, isotop_call.filteredItems.length).map(function (item) { return item.element; });
                    $(hidden).addClass('hidden');
                    $grid.isotope('layout');
                };
                loadMore(show_item);
                $(".rs-portfolio-tab").on('click', function () { $(this).data('clicked', true); loadMore(show_item); });
            });
        } else {
            $('.grid').imagesLoaded(function () {
                var $grid = $('.grid').isotope({ itemSelector: '.grid-item', percentPosition: true, masonry: { columnWidth: '.grid-item' } });
                $('.featured-menu').on('click', 'button', function () {
                    $grid.isotope({ filter: $(this).attr('data-filter') });
                });
                $('.featured-menu button').on('click', function (event) {
                    $(this).siblings('.active').removeClass('active');
                    $(this).addClass('active');
                    event.preventDefault();
                });
            });
        }
    }
    if (has('.featured-load-item')) {
        var show_item_2 = $('.featured-load-item-count').attr('data-show');
        $(".featured-load-item").hide();
        $(".featured-load-item").slice(0, show_item_2).show();
        $("body").on('click touchstart', '.load-more', function (e) {
            e.preventDefault();
            $(".featured-load-item:hidden").slice(0, show_item_2).slideDown();
            if ($(".featured-load-item:hidden").length == 0) { $(".load-more").css('display', 'none'); }
        });
    }

    // Active accordion items
    var accordionItems = document.querySelectorAll('.rs-accordion-item.has-border-active');
    accordionItems.forEach(function (item) {
        item.addEventListener('click', function () {
            accordionItems.forEach(function (i) { i.classList.remove('active'); });
            item.classList.add('active');
        });
    });

    // Smooth scrolling: desktop mouse users only; Lenis is fetched on demand, never for touch / reduced-motion.
    if (has('.rs-smoother-yes') && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var ls = document.createElement('script');
        ls.src = 'assets/js/plugins/lenis.min.js';
        ls.onload = function () {
            var lenis = new Lenis({ smoothWheel: true, wheelMultiplier: 1.2, duration: 1.5, lerp: 0.1 });
            var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
            requestAnimationFrame(raf);
            document.querySelectorAll('a[href^="#"]').forEach(function (el) {
                el.addEventListener('click', function (e) {
                    var id = (el.getAttribute('href') || '').slice(1);
                    var target = id && document.getElementById(id);
                    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
                });
            });
        };
        document.head.appendChild(ls);
    }

    // Custom cursor ball: plain mouse-follow, no GSAP ticker (was ~200KB of GSAP on every page just for this)
    var ball = document.getElementById('cursor-ball');
    if (ball && matchMedia('(pointer:fine)').matches) {
        var cx = 0, cy = 0, cq = false;
        var HOVER = 'a, button, input[type=submit], .slick-arrow, .search_icons i, .rs-mnt, .rs-yrs, .rsoffwrap-close, .backtotop-wrap';
        document.addEventListener('mousemove', function (e) {
            cx = e.clientX; cy = e.clientY;
            if (!cq) { cq = true; requestAnimationFrame(function () { cq = false; ball.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0) translate(-50%,-50%)'; }); }
        }, { passive: true });
        document.addEventListener('mouseover', function (e) { ball.classList.toggle('tq-cur-hover', !!(e.target.closest && e.target.closest(HOVER))); }, { passive: true });
    }

    // image scale active
    var scaleItems = document.querySelectorAll('.rs-scale-item');
    if (scaleItems.length) {
        scaleItems.forEach(function (item) {
            item.addEventListener('mouseenter', function () {
                scaleItems.forEach(function (o) { o.classList.remove('active'); });
                item.classList.add('active');
            });
        });
        if (scaleItems[1]) { scaleItems[1].classList.add("active"); }
    }

    // Contact Form
    var form = $('#contact-form');
    if (form.length) {
        var formMessages = $('#form-messages');
        form.on('submit', function (e) {
            e.preventDefault();
            $.ajax({ type: 'POST', url: form.attr('action'), data: form.serialize() })
                .done(function (response) {
                    formMessages.removeClass('error').addClass('success').text(response);
                    $('#name, #email, #message, #phone, #website, #subject, #date, #time').val('');
                })
                .fail(function (data) {
                    formMessages.removeClass('success').addClass('error');
                    formMessages.text(data.responseText !== '' ? data.responseText : 'Oops! An error occurred and your message could not be sent.');
                });
        });
    }
})(jQuery);
