// .hs-hscroll rows: arrow buttons + mouse drag (touch scrolls natively)
(function () {
    document.addEventListener('click', function (e) {
        var b = e.target.closest('[data-hs-scroll]');
        if (!b) return;
        var row = document.getElementById(b.dataset.hsTarget);
        var card = row && row.firstElementChild;
        if (!card) return;
        var step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(row).columnGap || 0);
        var dir = getComputedStyle(row).direction === 'rtl' ? -1 : 1;
        row.scrollBy({ left: (b.dataset.hsScroll === 'next' ? 1 : -1) * dir * step, behavior: 'smooth' });
    });
    document.querySelectorAll('.hs-hscroll').forEach(function (row) {
        var down = false, moved = false, x0 = 0, s0 = 0;
        row.addEventListener('dragstart', function (e) { e.preventDefault(); });
        row.addEventListener('pointerdown', function (e) {
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            down = true; moved = false; x0 = e.clientX; s0 = row.scrollLeft;
        });
        window.addEventListener('pointermove', function (e) {
            if (!down) return;
            var dx = e.clientX - x0;
            if (!moved && Math.abs(dx) < 6) return;
            if (!moved) { moved = true; row.classList.add('is-dragging'); }
            row.scrollLeft = s0 - dx;
        });
        window.addEventListener('pointerup', function () {
            if (!down) return;
            down = false;
            row.classList.remove('is-dragging');
        });
        // a drag must not count as a click on the card link
        row.addEventListener('click', function (e) {
            if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
        }, true);
    });
})();
