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
