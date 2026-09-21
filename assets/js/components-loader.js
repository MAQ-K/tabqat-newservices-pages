(function () {
    // Local dev servers with live-reload (e.g. VS Code "Live Server") inject their own
    // reload <script> into every .html response — including this fetch — and can
    // truncate the body in the process, silently dropping everything after their
    // injection point. Never happens on a real static host. Guard against it by
    // requiring the response to end with the fragment's known closing comment before
    // trusting it; a few quick retries usually get a clean response anyway. If it never
    // does, leave the page's own pre-baked fallback markup (already in the DOM) alone
    // instead of overwriting it with a broken fragment.
    // Fetched asynchronously (not blocking) since offcanvas/footer already have
    // pre-baked fallback markup in the DOM — this just keeps them in sync with the
    // shared component source without costing render-blocking round trips.
    function fetchComplete(url, endMarker, attemptsLeft) {
        return fetch(url).then(function (res) {
            if (!res.ok) return null;
            return res.text().then(function (html) {
                if (html.trim().slice(-endMarker.length) === endMarker) return html;
                if (attemptsLeft > 0) return fetchComplete(url, endMarker, attemptsLeft - 1);
                return null;
            });
        }).catch(function () { return null; });
    }

    function inject(id, url, endMarker) {
        var el = document.getElementById(id);
        if (!el) return Promise.resolve();
        // Already has pre-baked markup (the common case on every shipped page) — trust it and
        // skip the network round trip entirely. Plugins like meanmenu transform this markup
        // in place on document ready; replacing it later out from under them would break the
        // mobile menu. Only genuinely empty containers (e.g. a page not yet baked) get fetched.
        if (el.innerHTML.trim() !== '') return Promise.resolve();
        return fetchComplete(url, endMarker, 3).then(function (html) {
            if (html !== null) el.innerHTML = html;
        });
    }

    var headerType = document.body.getAttribute('data-header') || 'inner';
    var headerReady = inject('site-header', 'components/header-' + headerType + '.html', '<!-- Header area end -->');
    inject('site-offcanvas', 'components/offcanvas.html', '<!-- Offcanvas area end -->');
    var footerReady = inject('site-footer', 'components/footer.html', '<!-- footer area end -->');

    headerReady.then(function () {
        // Auto-highlight the current page's nav link
        var currentPage = window.location.pathname.split('/').pop() || 'index.html';
        var navLinks = document.querySelectorAll('#mobile-menu .multipage-menu > li > a');
        navLinks.forEach(function (link) {
            if (link.getAttribute('href') === currentPage) {
                link.parentElement.classList.add('active');
            }
        });
    });

    footerReady.then(function () {
        // Set copyright year
        var yearEl = document.getElementById('year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    });
})();
