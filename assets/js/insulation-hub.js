/**
 * insulation-hub.js
 * Scroll reveals + stat count-up for the insulation pages.
 * IntersectionObserver only (no scroll listeners). Honors prefers-reduced-motion.
 */
(function () {
    'use strict';

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- Scroll reveal ------------------------------------------------ */
    var revealables = document.querySelectorAll('[data-reveal]');

    if (reduce || !('IntersectionObserver' in window)) {
        Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-revealed'); });
    } else {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                revealObserver.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

        Array.prototype.forEach.call(revealables, function (el) { revealObserver.observe(el); });
    }

    /* ---- Stat count-up ------------------------------------------------ */
    var counters = document.querySelectorAll('[data-count-to]');

    function paint(el, value) {
        el.textContent = (el.getAttribute('data-prefix') || '') + value + (el.getAttribute('data-suffix') || '');
    }

    function countUp(el) {
        var target = parseInt(el.getAttribute('data-count-to'), 10);
        if (isNaN(target)) return;
        var duration = 1400;
        var started = null;
        var done = false;

        function finish() {
            if (done) return;
            done = true;
            paint(el, target);
        }

        function frame(now) {
            if (done) return;
            if (started === null) started = now;
            var progress = Math.min((now - started) / duration, 1);
            // easeOutCubic: fast start, gentle settle
            var eased = 1 - Math.pow(1 - progress, 3);
            paint(el, Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(frame); else finish();
        }
        requestAnimationFrame(frame);
        // Safety net: if frames are throttled or delayed, land on the exact number anyway.
        setTimeout(finish, duration + 150);
    }

    /* ---- Side index: highlight the service section currently in view -- */
    Array.prototype.forEach.call(document.querySelectorAll('[data-index]'), function (index) {
        var links = index.querySelectorAll('a');
        if (!links.length || !('IntersectionObserver' in window)) return;

        var targets = [];
        Array.prototype.forEach.call(links, function (link) {
            var section = document.querySelector(link.getAttribute('href'));
            if (section) targets.push({ link: link, section: section });
        });
        if (!targets.length) return;

        function activate(link) {
            Array.prototype.forEach.call(links, function (other) {
                other.classList.toggle('is-active', other === link);
            });
        }

        var indexObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var match = targets.filter(function (t) { return t.section === entry.target; })[0];
                if (match) activate(match.link);
            });
        }, { rootMargin: '-15% 0px -70% 0px' });

        targets.forEach(function (t) { indexObserver.observe(t.section); });
        // Clicking marks straight away. The theme's own anchor handler does the smooth
        // scrollIntoView (scroll-margin-top puts the title under the sticky header);
        // if something swallows it, land the section manually.
        targets.forEach(function (t) {
            t.link.addEventListener('click', function () {
                activate(t.link);
                var before = window.pageYOffset;
                var wanted = before + t.section.getBoundingClientRect().top - 120;
                setTimeout(function () {
                    if (Math.abs(window.pageYOffset - wanted) > 40 && Math.abs(window.pageYOffset - before) < 10) {
                        window.scrollTo(0, wanted);
                    }
                }, 450);
            });
        });
    });

    /* ---- Process steps: sequential activation + hover tracking ------- */
    Array.prototype.forEach.call(document.querySelectorAll('[data-steps]'), function (list) {
        var steps = list.querySelectorAll('.ins-step');
        if (!steps.length) return;
        var played = 0;

        function progress(value) {
            list.style.setProperty('--p', value);
        }

        function runSequence() {
            Array.prototype.forEach.call(steps, function (stepEl, i) {
                setTimeout(function () {
                    stepEl.classList.add('is-on');
                    played = (i + 1) / steps.length;
                    progress(played);
                }, i * 220);
            });
        }

        if (reduce || !('IntersectionObserver' in window)) {
            Array.prototype.forEach.call(steps, function (stepEl) { stepEl.classList.add('is-on'); });
            played = 1;
            progress(1);
        } else {
            progress(0);
            var stepObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    stepObserver.disconnect();
                    runSequence();
                });
            }, { threshold: 0.4 });
            stepObserver.observe(list);

            // Hovering a step runs the line to it, then it settles back
            Array.prototype.forEach.call(steps, function (stepEl, i) {
                stepEl.addEventListener('mouseenter', function () { progress((i + 1) / steps.length); });
                stepEl.addEventListener('mouseleave', function () { progress(played); });
            });
        }
    });

    /* ---- Service rail: arrows, dots, RTL-aware paging ---------------- */
    Array.prototype.forEach.call(document.querySelectorAll('[data-rail]'), function (rail) {
        var track = rail.querySelector('.ins-rail__track');
        var boxes = track ? track.querySelectorAll('.ins-box') : [];
        var prev = rail.querySelector('[data-rail-prev]');
        var next = rail.querySelector('[data-rail-next]');
        var dots = rail.querySelectorAll('[data-rail-dot]');
        if (!track || !boxes.length) return;

        // In RTL the track scrolls toward negative scrollLeft, so paging flips sign.
        var sign = getComputedStyle(track).direction === 'rtl' ? -1 : 1;

        // 'auto' would defer to the CSS scroll-behavior (smooth), so jump with 'instant'
        var behavior = reduce ? 'instant' : 'smooth';

        // Boxes are equal width, so one step is box + gap, and box i sits at i * step.
        function step() {
            var box = boxes[0].getBoundingClientRect().width;
            var gap = parseFloat(getComputedStyle(track).columnGap || '20') || 20;
            return (box + gap) || 1;
        }

        function maxPos() {
            return Math.max(0, track.scrollWidth - track.clientWidth);
        }

        // Paint dot and arrow state for a scroll position measured from the start edge.
        function paintState(pos) {
            var index = Math.round(pos / step());
            index = Math.max(0, Math.min(index, boxes.length - 1));
            Array.prototype.forEach.call(dots, function (dot, i) {
                dot.setAttribute('aria-current', i === index ? 'true' : 'false');
            });
            if (prev) prev.disabled = pos < 4;
            if (next) next.disabled = pos >= maxPos() - 4;
        }

        function goTo(pos) {
            pos = Math.max(0, Math.min(pos, maxPos()));
            track.scrollTo({ left: sign * pos, behavior: behavior });
            // Taking state from the target keeps it correct mid-animation.
            paintState(pos);
        }

        if (next) next.addEventListener('click', function () { goTo(Math.abs(track.scrollLeft) + step()); });
        if (prev) prev.addEventListener('click', function () { goTo(Math.abs(track.scrollLeft) - step()); });

        Array.prototype.forEach.call(dots, function (dot, i) {
            dot.addEventListener('click', function () { goTo(i * step()); });
        });

        // Drag the rail with the cursor
        var dragging = false;
        var startX = 0;
        var startScroll = 0;
        var moved = 0;

        track.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'touch') return;   // native touch scrolling is fine
            dragging = true;
            moved = 0;
            startX = e.clientX;
            startScroll = track.scrollLeft;
            track.classList.add('is-dragging');
        });

        track.addEventListener('pointermove', function (e) {
            if (!dragging) return;
            var delta = e.clientX - startX;
            moved = Math.abs(delta);
            track.scrollLeft = startScroll + delta;
        });

        function endDrag() {
            if (!dragging) return;
            dragging = false;
            track.classList.remove('is-dragging');
            // Settle on the nearest box after a drag
            if (moved > 6) goTo(Math.round(Math.abs(track.scrollLeft) / step()) * step());
        }

        track.addEventListener('pointerup', endDrag);
        track.addEventListener('pointercancel', endDrag);
        track.addEventListener('pointerleave', endDrag);
        // A drag should not open the box it finished on
        track.addEventListener('click', function (e) {
            if (moved > 6) { e.preventDefault(); moved = 0; }
        }, true);

        // Manual scrolling (wheel, touch, keyboard) keeps the state in sync as well.
        var queued = null;
        track.addEventListener('scroll', function () {
            if (queued !== null) return;
            queued = requestAnimationFrame(function () {
                queued = null;
                paintState(Math.abs(track.scrollLeft));
            });
        }, { passive: true });

        paintState(0);
    });

    if (reduce || !('IntersectionObserver' in window)) {
        Array.prototype.forEach.call(counters, function (el) {
            paint(el, parseInt(el.getAttribute('data-count-to'), 10) || 0);
        });
    } else {
        Array.prototype.forEach.call(counters, function (el) { paint(el, 0); });

        var countObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                countUp(entry.target);
                countObserver.unobserve(entry.target);
            });
        }, { threshold: 0.6 });

        Array.prototype.forEach.call(counters, function (el) { countObserver.observe(el); });
    }
})();
