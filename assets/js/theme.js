/**
 * Light / dark theme toggle.
 * The initial theme is applied by a tiny inline script in each page's <head> (before first
 * paint, so there is no flash); this file adds the toggle button and handles switching.
 * Choice is saved in localStorage; with no saved choice the OS preference is followed.
 */
(function () {
    var root = document.documentElement;
    var KEY = 'theme';
    var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function saved() {
        try { var t = localStorage.getItem(KEY); return t === 'dark' || t === 'light' ? t : null; } catch (e) { return null; }
    }
    function current() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }

    function apply(theme) {
        root.setAttribute('data-theme', theme);
        root.setAttribute('data-bs-theme', theme);
        var buttons = document.querySelectorAll('.theme-toggle');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
            buttons[i].setAttribute('aria-label', theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
            buttons[i].title = buttons[i].getAttribute('aria-label');
        }
    }

    function toggle() {
        var next = current() === 'dark' ? 'light' : 'dark';
        root.classList.add('theme-switching');
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
        setTimeout(function () { root.classList.remove('theme-switching'); }, 400);
    }

    function makeButton() {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'theme-toggle';
        b.innerHTML = '<i class="ri-moon-line theme-toggle__moon" aria-hidden="true"></i>' +
                      '<i class="ri-sun-line theme-toggle__sun" aria-hidden="true"></i>';
        b.addEventListener('click', toggle);
        return b;
    }

    function mount() {
        // One toggle per header (pages may also have a sticky clone of the header).
        var spots = document.querySelectorAll('.rs-header-right');
        for (var i = 0; i < spots.length; i++) {
            if (spots[i].querySelector('.theme-toggle')) continue;
            var burger = spots[i].querySelector('.rs-header-hamburger');
            spots[i].insertBefore(makeButton(), burger || null);
        }
        // Pages without the site header still get a floating toggle.
        if (!spots.length && !document.querySelector('.theme-toggle')) {
            var f = makeButton();
            f.classList.add('theme-toggle--floating');
            document.body.appendChild(f);
        }
        apply(current());
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();

    // Follow OS changes until the visitor picks a theme themselves.
    if (mq) {
        var onChange = function (e) { if (!saved()) apply(e.matches ? 'dark' : 'light'); };
        if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
    }
})();
