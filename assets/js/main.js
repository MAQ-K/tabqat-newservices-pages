(function ($) {
    "use strict";
    var windowOn = $(window);

    /* Windows Load */
    $(window).on('load', function () {
        wowAnimation();
    });


    /* Preloader activation */
    $(window).on('load', function (event) {
        $("#pre-load").delay(600).fadeOut(500);
        $(".pre-loader").delay(600).fadeOut(500);
    });

    /* footer year */
    var yearElement = document.getElementById("year");
    if (yearElement) { yearElement.innerHTML = new Date().getFullYear(); }
    /* footer year */

    /* Wow Active */
    function wowAnimation() {
        var wow = new WOW({
            boxClass: 'wow',
            animateClass: 'animated',
            offset: 0,
            mobile: false,
            live: true
        });
        wow.init();
    }

    /*======================================
Sidebar Toggle
========================================*/
    $(".offcanvas-close,.offcanvas-overlay").on("click", function () {
        $(".offcanvas-area").removeClass("info-open");
        $(".offcanvas-overlay").removeClass("overlay-open");
    });
    $(".sidebar-toggle").on("click", function (e) {
        e.preventDefault();
        $(".offcanvas-area").addClass("info-open");
        $(".offcanvas-overlay").addClass("overlay-open");
    });

    /* Body overlay Js */
    $(".body-overlay").on("click", function () {
        $(".offcanvas-area").removeClass("opened");
        $(".body-overlay").removeClass("opened");
    });

    /* Data Css js */
    $("[data-background").each(function () {
        $(this).css(
            "background-image",
            "url( " + $(this).attr("data-background") + "  )"
        );
    });

    $("[data-width]").each(function () {
        $(this).css("width", $(this).attr("data-width"));
    });

    $("[data-bg-color]").each(function () {
        $(this).css("background-color", $(this).attr("data-bg-color"));
    });

    /* MagnificPopup image view */
    $(".popup-image").magnificPopup({
        type: "image",
        gallery: {
            enabled: true,
        },
    });

    /* jarallax js */
    jarallax(document.querySelectorAll('.jarallax'), {
        speed: 0.5,
    });

    /* MagnificPopup video view */
    $(".popup-video").magnificPopup({
        type: "iframe",
    });

    /* Nice Select Js */
    $("select").niceSelect();

    /* PureCounter Js */
    new PureCounter();
    new PureCounter({
        filesizing: true,
        selector: ".filesizecount",
        pulse: 2,
    });

    /* pricing */
    var mainPlan = $('.rs-pricing-area');
    mainPlan.each(function () {
        var yearlySelectBtn = $('.yearly-plan-btn'),
            monthlySelectBtn = $('.monthly-plan-btn'),
            monthlyPrice = $('.monthly-pricing'),
            yearlyPrice = $('.yearly-pricing'),
            buttonSlide = $('.pricing-checkbox');

        $(monthlySelectBtn).on('click', function () {
            buttonSlide.prop('checked', true);
            $(this).addClass('active').parent('.rs-pricing-tab').siblings().children().removeClass('active');
            monthlyPrice.css('display', 'block');
            yearlyPrice.css('display', 'none');
        });

        $(yearlySelectBtn).on('click', function () {
            buttonSlide.prop('checked', false);
            $(this).addClass('active').parent('.rs-pricing-tab').siblings().children().removeClass('active');
            monthlyPrice.css('display', 'none');
            yearlyPrice.css('display', 'block');
        });

    });

    //===== Odometer js
    $('.odometer').appear(function (e) {
        var odo = $(".odometer");
        odo.each(function () {
            var countNumber = $(this).attr("data-count");
            $(this).html(countNumber);
        });
    });

    //search
    $('.rs-header-search-icon').on('click', function (event) {
        $('.rs-stickys-form').slideToggle('show');
        $(this).toggleClass('icon-close');
    });

    // tooltip
    document.addEventListener("DOMContentLoaded", function() {
        var tooltipTriggers = document.querySelectorAll(".rs-portfolio-tooltip .rs-portfolio-tooltip-item");
        tooltipTriggers.forEach(function(element) {
            element.addEventListener("mousemove", myFunction);
        });
        function myFunction(e) {
            var x = e.clientX;
            var y = e.clientY;
            var tooltipTrigger = e.currentTarget;
            var tooltip = tooltipTrigger.querySelector(".rs-portfolio-tooltip .rs-portfolio-tooltip-content");
            var triggerRect = tooltipTrigger.getBoundingClientRect();
            var offsetX = x - triggerRect.left;
            var offsetY = y - triggerRect.top;
            var tooltipRect = tooltip.getBoundingClientRect();
            var triggerWidth = triggerRect.width;
            var triggerHeight = triggerRect.height;
            var tooltipWidth = tooltipRect.width;
            var tooltipHeight = tooltipRect.height;
            var buffer = 200;
            var maxX = triggerWidth - tooltipWidth + buffer;
            var maxY = triggerHeight - tooltipHeight + buffer;
            var left = Math.min(Math.max(x - triggerRect.left - tooltipWidth / 2, -buffer), maxX);
            var top = Math.min(Math.max(y - triggerRect.top - tooltipHeight / 2, -buffer), maxY);
            tooltip.style.left = left + "px";
            tooltip.style.top = top + "px";
        }
    });

    $(document).ready(function () {
        // button style
        $('.rs-button-wrapper .rs-btn').mouseenter(function () {
            $(this).find('.rs-icon').css('animation', 'btnHoverEffect 0.5s');
        });
        $('.rs-button-wrapper .rs-btn').mouseleave(function () {
            $(this).find('.rs-icon').css('animation', 'btnHoverEffectReverse 0.5s');
        });

        // circle text slide
        if ($('.rs-text-circle').length) {
            $(".rs-text-circle").each(function () {
                // Wrap all charecter inside a span
                var sentence = $(this).text().replace(/\s+/g, ' ').trim();
                var wrappedSentence = '';
                for (var i = 0; i < sentence.length; i++) {
                    wrappedSentence += '<span>' + sentence[i] + '</span>';
                }
                $(this).html(wrappedSentence);

                // Give a rotate value for each span
                var rotateDegree = parseInt($(this).data("rotate-degree"), 10) || 20;
                $(this).find("span").each(function (index) {
                    $(this).css("transform", "rotate(" + ((index + 1) * rotateDegree) + "deg)");
                });
            });
        }

        // Swiper Dynamic Slider Active
        $('.rs-swiper .swiper').each(function (index) {
            var $swiper = $(this);
            var hoverAutoplay = $swiper.data('hover-pause') === undefined ? true : $swiper.data('hover-pause');
            var loop = $(this).data('loop') === undefined ? true : $(this).data('loop');
            var centeredSlides = $(this).data('center-mode') === undefined ? false : $(this).data('center-mode');
            var autoplay = $(this).data('autoplay') === undefined ? true : $(this).data('autoplay');
            var dynamicBullets = $(this).data('dots-dynamic') === undefined ? true : $(this).data('dots-dynamic');
            var direction = $(this).data('direction') === 'vertical' ? 'vertical' : 'horizontal';
            var fridgeMovement = $(this).data('play-slide') === undefined ? true : $(this).data('play-slide');
            var effect = $(this).data('effect') || 'slide'; //'slide' | 'fade' | 'cube' | 'coverflow' | 'flip' | 'creative' | 'cards';
            var grabCursor = $(this).data('grab-cursor') === undefined ? false : $(this).data('grab-cursor');
            var oneWayMovement = $(this).data('one-way') === undefined ? false : $(this).data('one-way');
            var startAt = $(this).data('start-at');
            var slidesPerView = $(this).data('item');
            var speed = $(this).data('speed');
            var gap = (($(this).data('no-gap') === true) ? 0 : 30);
            var margin = ($(this).data('margin') ? $(this).data('margin') : gap);


            // Breakpoints
            var slidesPerViewXl = $(this).data('item-xl');
            var slidesPerViewLg = $(this).data('item-lg');
            var slidesPerViewMd = $(this).data('item-md');
            var slidesPerViewSm = $(this).data('item-sm');
            var slidesPerViewXs = $(this).data('item-xs');
            var slidesPerViewMobile = $(this).data('item-mobile');
            var marginXl = ($(this).data('margin-xl') ? $(this).data('margin-xl') : margin);
            var marginLg = ($(this).data('margin-lg') ? $(this).data('margin-lg') : marginXl);
            var marginMd = ($(this).data('margin-md') ? $(this).data('margin-md') : marginLg);
            var marginSm = ($(this).data('margin-sm') ? $(this).data('margin-sm') : marginMd);
            var marginXs = ($(this).data('margin-xs') ? $(this).data('margin-xs') : marginSm);
            var marginMobile = ($(this).data('margin-mobile') ? $(this).data('margin-mobile') : marginXs);

            // Controls unique classes based on the index
            var rsNavPrev = `rs-nav-prev-${index}`;
            var rsNavNext = `rs-nav-next-${index}`;
            $swiper.closest('.rs-swiper').find('.swiper-button-prev').addClass(rsNavPrev);
            $swiper.closest('.rs-swiper').find('.swiper-button-next').addClass(rsNavNext);

            var rsPagination = `rs-pagination-${index}`;
            $swiper.closest('.rs-swiper').find('.swiper-pagination').addClass(rsPagination);

            var swiper = new Swiper(this, {
                loop: loop,
                autoplay: autoplay,  // data-autoplay="true" => Delay | .swiper-slide | data-swiper-autoplay="2000">
                direction: direction,
                effect: effect,
                fadeEffect: { crossFade: true }, // without this, the outgoing slide's text can stay stacked on top of the incoming one (loop + fade + pagination-jump bug)
                enabled: fridgeMovement,
                grabCursor: grabCursor,
                oneWayMovement: oneWayMovement,
                centeredSlides: centeredSlides,
                initialSlide: (startAt ? startAt : 0),
                slidesPerView: (slidesPerView ? slidesPerView : 1),
                spaceBetween: margin,
                speed: (speed ? speed : 500),

                pagination: {
                    el: `.${rsPagination}`,
                    dynamicBullets: dynamicBullets,
                    clickable: true,
                },

                navigation: {
                    nextEl: `.${rsNavPrev}`,
                    prevEl: `.${rsNavNext}`,
                },

                breakpoints: {
                    10: {
                        slidesPerView: (slidesPerViewMobile ? slidesPerViewMobile : 1),
                        spaceBetween: marginMobile,
                    },
                    481: {
                        slidesPerView: (slidesPerViewXs ? slidesPerViewXs : 1),
                        spaceBetween: marginXs,
                    },
                    576: {
                        slidesPerView: (slidesPerViewSm ? slidesPerViewSm : 1),
                        spaceBetween: marginSm,
                    },
                    768: {
                        slidesPerView: (slidesPerViewMd ? slidesPerViewMd : 1),
                        spaceBetween: marginMd,
                    },
                    992: {
                        slidesPerView: (slidesPerViewLg ? slidesPerViewLg : 1),
                        spaceBetween: marginLg,
                    },
                    1025: {
                        slidesPerView: (slidesPerViewXl ? slidesPerViewXl : 1),
                        spaceBetween: marginXl,
                    },
                    1201: {
                        slidesPerView: (slidesPerView ? slidesPerView : 1),
                        spaceBetween: margin,
                    }
                }
            });
            if (hoverAutoplay) {
                $swiper.on('mouseenter', function () {
                    swiper.autoplay.stop();
                }).on('mouseleave', function () {
                    swiper.autoplay.start();
                });
            }
        });

            /* product active */
            var productDetails = new Swiper(".product-details-nav", {
                spaceBetween: -20,
                slidesPerView: 4,
                navigation: {
                    nextEl: ".product-details-button-next",
                    prevEl: ".product-details-button-prev",
                },
            });

            /* product small thumb active */
            var productDetailsActive = new Swiper(".product-details-active", {
                spaceBetween: 0,
                thumbs: {
                    swiper: productDetails,
                },
                navigation: {
                    nextEl: ".product-details-button-next",
                    prevEl: ".product-details-button-prev",
                },
            });

            /* Shop Cart minus */
            $('.rs-cart-minus').on('click', function () {
                var $input = $(this).parent().find('input');
                var count = parseInt($input.val(), 10) - 1; // Adding radix parameter
                count = count < 1 ? 1 : count;
                $input.val(count);
                $input.change();
                return false;
            });

            /* Shop Cart plus */
            $('.rs-cart-plus').on('click', function () {
                var $input = $(this).parent().find('input');
                $input.val(parseInt($input.val(), 10) + 1); // Adding radix parameter
                $input.change();
                return false;
            });

                /* row remove activation */
            $('.removeRow').on('click', function () {
                $(this).closest('tr').remove();
            });

            /* Show Login Toggle Js */
            $('.checkout-login-form-reveal-btn').on('click', function () {
                $('#checkout-coupon').slideToggle(400);
            });
           

        /* Button scroll up js */
        var progressPath = document.querySelector(".backtotop-wrap path");
        var pathLength = progressPath.getTotalLength();
        progressPath.style.transition = progressPath.style.WebkitTransition = "none";
        progressPath.style.strokeDasharray = pathLength + " " + pathLength;
        progressPath.style.strokeDashoffset = pathLength;
        progressPath.getBoundingClientRect();
        progressPath.style.transition = progressPath.style.WebkitTransition = "stroke-dashoffset 10ms linear";
        var updateProgress = function () {
            var scroll = $(window).scrollTop();
            var height = $(document).height() - $(window).height();
            var progress = pathLength - (scroll * pathLength) / height;
            progressPath.style.strokeDashoffset = progress;
        };
        updateProgress();
        $(window).scroll(updateProgress);
        var offset = 150;
        var duration = 550;
        $(window).on("scroll", function () {
            if ($(this).scrollTop() > offset) {
                $(".backtotop-wrap").addClass("active-progress");
            } else {
                $(".backtotop-wrap").removeClass("active-progress");
            }

            // Sticky Header
            if ($(this).scrollTop() > 250) {
                $("#header-sticky").addClass("rs-sticky");
            } else {
                $("#header-sticky").removeClass("rs-sticky");
            }
        });
        $(".backtotop-wrap").on("click", function (event) {
            event.preventDefault();
            $("html, body").animate({
                scrollTop: 0
            }, parseInt(duration, 10)); /* Fixing parseInt call with radix parameter */
            return false;
        });

        /* slider-rang js */
        var slider1 = document.getElementById('slider-range'); // Changed variable name to slider1
        var minValue = 0;
        var maxValue = 2500;
        if ($("#slider-range").length) {
            noUiSlider.create(slider1, {
                start: [0, 1100],
                connect: true,
                range: {
                    'min': minValue,
                    'max': maxValue
                }
            });

            var amount1 = document.getElementById('amount'); // Changed variable name to amount1
            slider1.noUiSlider.on('update', function (values, handle) {
                amount1.value = "$" + values[0] + " - $" + values[1];
            });

            $('#filter-btn').on('click', function () {
                $('.filter-widget').slideToggle(1000);
            });
        }

  
        //  hotspots
        jQuery('.rs-ripple-item').each(function(index) {
            var uniqueClass = 'rs-ripple-item-' + index;
            jQuery(this).addClass(uniqueClass);
            var parentHotspots = jQuery(this).closest('.rs-contact-wrapper');
            var targetMobileItem = parentHotspots.find('.mobile_item').eq(index);
            jQuery(this).on('click', function() {
                if (targetMobileItem.hasClass('active')) {
                    targetMobileItem.removeClass('active');
                } else {
                    parentHotspots.find('.mobile_item.active').removeClass('active');
                    targetMobileItem.addClass('active');
                }
            });
            parentHotspots.on('click', '.remove-icon', function(event) {
                event.stopPropagation();
                targetMobileItem.removeClass('active');
            });
        });

        // Ripple Class Switching
        var switches = jQuery('.rs-contact-wrapper .rs-ripple-item');
        var currentIndex = 0;
        var interval;
        var speed = 1500;

        function startRotation() {
            interval = setInterval(function() {
                switches.eq(currentIndex).removeClass('ripple');
                currentIndex = (currentIndex + 1) % switches.length;
                switches.eq(currentIndex).addClass('ripple');
            }, speed);
        }
        function stopRotation() {
            clearInterval(interval);
            switches.eq(currentIndex).removeClass('ripple');
        }
        startRotation();
        switches.on('mouseenter', function () {
            stopRotation();
        }).on('mouseleave', function () {
            startRotation();
        });
  
        // pie chart
        if ($('#pie-chart').length) {
            new Chart(document.getElementById("pie-chart") , {
                type : "pie",
                data : {
                    labels : ["Sciences & Healthcare","Power Generation","Retail & Consumer","Industrial & Chemical","Oil & Gas Energy"],
                    datasets : [ {
                        backgroundColor : ["#0D80CE","#5CC8BE","#3B37FD","#EE0D08","#EA5501"],
                        data : ["16","36","46","56","76"],
                    } ]
                },
                options : {
                    responsive : true,
                    layout:{
                        padding:0,
                    },
                    plugins: {
                        legend: {
                            position: "left",                              
                            labels:{
                                color: '#1F1F1F',
                                padding:15,
                                boxWidth:12,
                                boxHeight:12,
                                font: {
                                    size: 15,
                                    weight: 600,
                                }
                            }
                        },                          
                    }
                }
            });
        }

       
        // Menu Active
        const currentPath = window.location.pathname.split('/').pop();
        const menuLinks = document.querySelectorAll('.multipage-menu a');
        menuLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
                link.classList.add('active');
                let parentLi = link.parentElement;
                while (parentLi) {
                    if (parentLi.tagName === 'LI') {
                        parentLi.classList.add('active');
                    }
                    parentLi = parentLi.parentElement;
                }
            }
        });


        /* Mobile Menu Js */
        $("#mobile-menu").meanmenu({
            meanMenuContainer: ".mobile-menu",
            meanScreenWidth: "1199",
            meanExpand: ['<i class="fa-regular fa-plus"></i>'],
        });

        /*======================================
          One Page overlay close
        ========================================*/
        function scrollNav() {
            $(".onepage-menu li a").on('click', function () {
                $(".onepage-menu li a.active").removeClass("active");
                $(this).addClass("active");
                $(".offcanvas-area").removeClass("info-open");
                $(".offcanvas-overlay").removeClass("overlay-open");
            });
        }
        scrollNav();

        /* countdown activation start */
        function makeTimer(endTime, countdownElementId) {
            var now = new Date();
            now = (Date.parse(now) / 1000);
            var timeLeft = endTime - now;
            if (timeLeft <= 0) {
                clearInterval(timerInterval); // Stop the timer
                $("#" + countdownElementId + " [data-unit='days']").html("00<span>Days</span>");
                $("#" + countdownElementId + " [data-unit='hours']").html("00<span>Hours</span>");
                $("#" + countdownElementId + " [data-unit='minutes']").html("00<span>Minutes</span>");
                $("#" + countdownElementId + " [data-unit='seconds']").html("00<span>Seconds</span>");
                return;
            }
            var days = Math.floor(timeLeft / 86400);
            var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
            var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600)) / 60);
            var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));
            if (hours < "10") { hours = "0" + hours; }
            if (minutes < "10") { minutes = "0" + minutes; }
            if (seconds < "10") { seconds = "0" + seconds; }
            $("#" + countdownElementId + " [data-unit='days']").html(days + "<span>Days</span>");
            $("#" + countdownElementId + " [data-unit='hours']").html(hours + "<span>Hours</span>");
            $("#" + countdownElementId + " [data-unit='minutes']").html(minutes + "<span>Minutes</span>");
            $("#" + countdownElementId + " [data-unit='seconds']").html(seconds + "<span>Seconds</span>");
        }
        var endTime = new Date("5 August 2025 14:00:00 GMT+06:00");
        endTime = (Date.parse(endTime) / 1000);
        var timerInterval = setInterval(function () {
            makeTimer(endTime, "countdown1");
            makeTimer(endTime, "countdown2");
            makeTimer(endTime, "countdown3");
            makeTimer(endTime, "countdown4");
            makeTimer(endTime, "countdown5");
        }, 1000);

        // Tab Auto Switcher
        if ($('.rs-services-tab-wrapper.auto-switch').length) {
            var interval = 5000;
            var autoSwitchTimer;
            function switchTabs() {
                var $activeTab = $('.rs-services-tab-wrapper.auto-switch .nav-item .nav-link.active');
                var $nextTab = $activeTab.closest('.nav-item').next('.nav-item').find('.nav-link');
                if (!$nextTab.length) {
                    $nextTab = $('.rs-services-tab-wrapper.auto-switch .nav-item').first().find('.nav-link');
                }
                $nextTab.trigger('click');
            }
            function startAutoSwitch() {
                autoSwitchTimer = setInterval(switchTabs, interval);
            }
            startAutoSwitch();
            $('.rs-services-tab-wrapper.auto-switch').on('mouseenter', function() {
                clearInterval(autoSwitchTimer);
            });
            $('.rs-services-tab-wrapper.auto-switch').on('mouseleave', function() {
                startAutoSwitch();
            });
        }
    });
    

    /* pralax image */
    if ($('.prallax-parent').length) {
        $(".prallax-parent").each(function () {
            var prallaxParent = $(this).get(0);
            var parallaxInstance = new Parallax(prallaxParent);
        });
    }


    // marquee slide
    let SwiperMarquee = new Swiper('.rs-marquee-slide', {
        spaceBetween: 0,
        centeredSlides: true,
        speed: 10000,
        autoplay: {
          delay: 1,
        },
        loop: true,
        slidesPerView:'auto',
        allowTouchMove: false,
        disableOnInteraction: true
      });

    /* portfolio tab */
    if ($('.portfolio-load-more').length > 0) {
        $('.grid').imagesLoaded(function () {
            // init Isotope
            var $grid = $('.grid').isotope({
                itemSelector: '.grid-item',
                percentPosition: true,
                masonry: {
                    // use outer width of grid-sizer for columnWidth
                    columnWidth: '.grid-item',
                }
            });


            // filter items on button click
            $('.rs-portfolio-tab').on('click', 'button', function () {
                var filterValue = $(this).attr('data-filter');
                $grid.isotope({ filter: filterValue });
            });

            //for menu active class
            $('.rs-portfolio-tab button').on('click', function (event) {
                $(this).siblings('.active').removeClass('active');
                $(this).addClass('active');
                event.preventDefault();
            });

            var show_item = $('.portfolio-load-more').attr('data-show');
            var count_item = show_item;
            var isotop_call = $grid.data('isotope');

            loadMore(show_item);

            function loadMore(showing) {
                $grid.find(".hidden").removeClass("hidden");

                var hidden = isotop_call.filteredItems.slice(showing, isotop_call.filteredItems.length).map(function (item) {
                    return item.element;
                });

                $(hidden).addClass('hidden');
                $grid.isotope('layout');
            }

            $(".rs-portfolio-tab").on('click', function () {
                $(this).data('clicked', true);

                loadMore(show_item);
            });

        });
    } else {
        $('.grid').imagesLoaded(function () {
            // init Isotope
            var $grid = $('.grid').isotope({
                itemSelector: '.grid-item',
                percentPosition: true,
                masonry: {
                    // use outer width of grid-sizer for columnWidth
                    columnWidth: '.grid-item',
                }
            });


            // filter items on button click
            $('.featured-menu').on('click', 'button', function () {
                var filterValue = $(this).attr('data-filter');
                $grid.isotope({ filter: filterValue });
            });

            //for menu active class
            $('.featured-menu button').on('click', function (event) {
                $(this).siblings('.active').removeClass('active');
                $(this).addClass('active');
                event.preventDefault();
            });

        });

        var show_item_2 = $('.featured-load-item-count').attr('data-show');
        $(".featured-load-item").hide();
        $(".featured-load-item").slice(0, show_item_2).show();
        $("body").on('click touchstart', '.load-more', function (e) {
            e.preventDefault();
            $(".featured-load-item:hidden").slice(0, show_item_2).slideDown();
            if ($(".featured-load-item:hidden").length == 0) {
                $(".load-more").css('display', 'none');
            }

        });
    }

    // Active accordion items
    const accordionItems = document.querySelectorAll('.rs-accordion-item.has-border-active');
    accordionItems.forEach(item => {
        item.addEventListener('click', () => {
            accordionItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    //    mouse move
    document.addEventListener('mousemove', function (event) {
        // Get the mouse position
        let x = event.clientX;
        let y = event.clientY;

        // Calculate the percentage of the mouse position relative to the window size
        let xPercent = (x / window.innerWidth) - 0.5;
        let yPercent = (y / window.innerHeight) - 0.5;

        // Select all the shapes
        let shapes = document.querySelectorAll('.shape-move img');

        // Loop through each shape and apply a transform based on mouse position
        shapes.forEach(function (shape, index) {
            // Modify the multiplier values to control the movement intensity
            let multiplierX = 40 + index * 2;
            let multiplierY = 40 + index * 2;

            let translateX = xPercent * multiplierX;
            let translateY = yPercent * multiplierY;

            shape.style.transform = `translate(${translateX}px, ${translateY}px)`;
        });
    });


    // Smooth Scroling
    if ($('.rs-smoother-yes').length) {
        const lenis = new Lenis({
            smoothWheel: true,
            wheelMultiplier: 1.2,
            duration: 1.5,
            lerp: 0.1,
        });
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Handle scroll animation for anchor links
        document.querySelectorAll('a[href^="#"]').forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault()
                const id = el.getAttribute('href')?.slice(1)
                if (!id) return
                const target = document.getElementById(id)
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' })
                }
            })
        });
    }

    // image scale active
    if ($('.rs-scale-item').length) {
        // Get all menu items
        const portfolio_items = document.querySelectorAll('.rs-scale-item');
        // Add event listeners to each item
        portfolio_items.forEach((item) => {
            item.addEventListener('mouseenter', () => {
                // Remove the 'active' class from all items
                portfolio_items.forEach((portfolio_item) => {
                    portfolio_item.classList.remove('active');
                });
                // Add the 'active' class to the hovered item
                item.classList.add('active');
            });
        });
        portfolio_items[1].classList.add("active");
    };

    //  text slide
    var roll_slider = new Swiper(".text-slide-one", {
        loop: true,
        freemode: true,
        slidesPerView: 4,
        spaceBetween: 0,
        // centeredSlides: false,
        allowTouchMove: false,
        speed: 10000,
        autoplay: {
            delay: 1,
            disableOnInteraction: true,
        },
    });

    // Contact Form Activation
    var form = $('#contact-form');
    var formMessages = $('#form-messages');
    $(form).submit(function (e) {
        e.preventDefault();
        var formData = $(form).serialize();
        $.ajax({
            type: 'POST',
            url: $(form).attr('action'),
            data: formData
        })
            .done(function (response) {
                $(formMessages).removeClass('error');
                $(formMessages).addClass('success');
                $(formMessages).text(response);
                $('#name, #email, #message').val('');
                if ($('#phone').length) $('#phone').val('');
                if ($('#website').length) $('#website').val('');
                if ($('#subject').length) $('#subject').val('');
                if ($('#date').length) $('#date').val('');
                if ($('#time').length) $('#time').val('');
            })
            .fail(function (data) {
                $(formMessages).removeClass('success');
                $(formMessages).addClass('error');
                if (data.responseText !== '') {
                    $(formMessages).text(data.responseText);
                } else {
                    $(formMessages).text('Oops! An error occurred and your message could not be sent.');
                }
            });
    });

})(jQuery);

