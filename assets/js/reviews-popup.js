// "All reviews on Google" opens the reviews in an in-page dialog (no new tab, no Google embed).
(function () {
    var dlg;
    function build(a) {
        var sec = a.closest('.tq-reviews');
        var num = sec.querySelector('.tq-reviews__num').textContent;
        var stars = sec.querySelector('.tq-stars').outerHTML;
        var count = sec.querySelector('.tq-reviews__meta small').textContent;
        var items = [].map.call(sec.querySelectorAll('.tq-rev:not([aria-hidden])'), function (li) {
            return '<li class="tq-rev">' + li.innerHTML + '</li>';
        }).join('');
        dlg = document.createElement('dialog');
        dlg.className = 'tq-pop';
        dlg.setAttribute('aria-label', 'تقييمات Google');
        dlg.innerHTML = '<button type="button" class="tq-pop__x" aria-label="إغلاق">&times;</button>' +
            '<div class="tq-pop__head"><span class="tq-reviews__num">' + num + '</span><span>' + stars + '<small>' + count + '</small></span></div>' +
            '<ul class="tq-pop__list">' + items + '</ul>' +
            '<a class="tq-pop__ext" target="_blank" rel="noopener" href="' + a.href + '">اكتب تقييمك على Google</a>';
        document.body.appendChild(dlg);
        dlg.querySelector('.tq-pop__x').onclick = function () { dlg.close(); };
        dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    }
    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a.tq-reviews__all');
        if (!a || !window.HTMLDialogElement) return;
        e.preventDefault();
        if (!dlg) build(a);
        dlg.showModal();
    });
})();

// Reviews row: slow auto-scroll + mouse drag (touch swipes natively). The list is baked twice,
// so when we pass half the width we jump back by half and the loop is seamless.
(function () {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.tq-reviews__marquee').forEach(function (box) {
        var rtl = getComputedStyle(box).direction === 'rtl' ? -1 : 1;
        var hover = false, down = false, moved = false, x0 = 0, s0 = 0;
        function half() { return box.scrollWidth / 2; }
        // keep the position in (0, half]: at 0 we can't scroll further back, so jump to the
        // identical spot in the second copy; past half, jump back into the first copy
        function wrap() {
            var h = half(), p = box.scrollLeft * rtl;
            if (p <= 0) box.scrollLeft += h * rtl;
            else if (p > h) box.scrollLeft -= h * rtl;
        }
        if (!reduce) {
            // scrollLeft is rounded to whole pixels, so sub-pixel steps would be lost:
            // keep our own float position and only resync when the user moved the row
            var last = 0, pos = null;
            (function tick(t) {
                if (pos === null || Math.abs(box.scrollLeft - pos) > 2) pos = box.scrollLeft;
                if (!hover && !down && last) {
                    pos += rtl * Math.min(t - last, 50) * 0.045;
                    box.scrollLeft = pos;
                    var b = box.scrollLeft;
                    wrap();
                    pos += box.scrollLeft - b;
                }
                last = t;
                requestAnimationFrame(tick);
            })(0);
        }
        box.addEventListener('mouseenter', function () { hover = true; });
        box.addEventListener('mouseleave', function () { hover = false; });
        box.addEventListener('dragstart', function (e) { e.preventDefault(); });
        box.addEventListener('pointerdown', function (e) {
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            down = true; moved = false; x0 = e.clientX; s0 = box.scrollLeft;
        });
        window.addEventListener('pointermove', function (e) {
            if (!down) return;
            var dx = e.clientX - x0;
            if (!moved && Math.abs(dx) < 6) return;
            if (!moved) { moved = true; box.classList.add('is-dragging'); }
            box.scrollLeft = s0 - dx;
            var b = box.scrollLeft;
            wrap();
            s0 += box.scrollLeft - b; // keep the drag anchored across a loop jump
        });
        window.addEventListener('pointerup', function () {
            if (!down) return;
            down = false;
            box.classList.remove('is-dragging');
        });
        box.addEventListener('click', function (e) {
            if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
        }, true);
    });
})();

// .tq-stats counters count up once when they scroll into view.
(function () {
    var els = document.querySelectorAll('.tq-stats [data-count-to]');
    if (!els.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            io.unobserve(en.target);
            var el = en.target, to = parseInt(el.getAttribute('data-count-to'), 10) || 0,
                pre = el.getAttribute('data-prefix') || '', t0 = null;
            (function step(t) {
                if (t0 === null) t0 = t;
                var k = Math.min((t - t0) / 1400, 1);
                el.textContent = pre + Math.round(to * (1 - Math.pow(1 - k, 3)));
                if (k < 1) requestAnimationFrame(step);
            })(performance.now());
        });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
})();
