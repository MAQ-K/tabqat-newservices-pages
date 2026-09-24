/* Sections slide up + fade in as they scroll into view (عزل pages). No-JS / reduced-motion: content stays visible. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var els = document.querySelectorAll('main .wp-scope, main .ins-sec, main .rs-logo-marquee-area');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('ss-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  els.forEach(function (el, i) {
    if (el.getBoundingClientRect().top < innerHeight) return; // already on screen: leave alone
    el.classList.add('ss', i % 2 ? 'ss-l' : 'ss-r');
    io.observe(el);
  });
})();
