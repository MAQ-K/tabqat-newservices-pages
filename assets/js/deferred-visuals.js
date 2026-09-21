/*
 * Loads the purely decorative animation stack on first user interaction.
 *
 * GSAP + ScrollTrigger, jarallax and Lenis each install a per-frame loop that
 * measures layout continuously. Together they were the single largest source of
 * main-thread blocking on this page -- several seconds of CPU on a throttled
 * mobile device -- while producing nothing the user can see until they scroll or
 * move the pointer. So we hold them back until that first interaction.
 *
 * Everything they drive (parallax backgrounds, the rotating circle text, smooth
 * scrolling, the custom cursor) is scroll- or hover-triggered, so a visitor never
 * sees a missing effect: the libraries are in place by the time one could apply.
 */
(function () {
    'use strict';

    var SCRIPTS = [
        'assets/js/plugins/gsap.min.js',
        'assets/js/plugins/rs-scroll-trigger.min.js',
        'assets/js/plugins/rs-anim-int.js',
        'assets/js/plugins/jarallax.min.js',
        'assets/js/plugins/lenis.min.js'
    ];

    // Deliberately no 'scroll': Chrome fires a trusted scroll event during load
    // (scroll restoration), which would defeat the whole point. 'wheel' and
    // 'touchstart' catch a real user scroll on desktop and mobile respectively.
    var EVENTS = ['pointerdown', 'wheel', 'touchstart', 'keydown', 'mousemove'];
    var started = false;

    function loadNext(i) {
        if (i >= SCRIPTS.length) return ready();
        var el = document.createElement('script');
        el.src = SCRIPTS[i];
        el.async = false;                 // preserve order: gsap before ScrollTrigger
        el.onload = el.onerror = function () { loadNext(i + 1); };
        document.body.appendChild(el);
    }

    function ready() {
        // main.js parsed before these libraries existed, so its init calls no-opped.
        // Both are idempotent and re-runnable; call them now that the libs are here.
        if (typeof window.rsInitJarallax === 'function') window.rsInitJarallax();
        if (typeof window.rsInitSmoothScroll === 'function') window.rsInitSmoothScroll();
    }

    function start() {
        if (started) return;
        started = true;
        EVENTS.forEach(function (e) { window.removeEventListener(e, start); });
        loadNext(0);
    }

    EVENTS.forEach(function (e) {
        window.addEventListener(e, start, { once: true, passive: true });
    });
})();
