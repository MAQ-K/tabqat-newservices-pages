(function () {
  'use strict';
  var track = document.getElementById('wp-track');
  if (!track) return;

  var prevBtn = document.querySelector('[data-wp-prev]');
  var nextBtn = document.querySelector('[data-wp-next]');
  var dotsBox = document.querySelector('.wp-dots');
  var slides  = Array.prototype.slice.call(track.children);
  if (!slides.length) return;

  var RTL = getComputedStyle(track).direction === 'rtl';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var positions = [], dots = [];
  function distance() { return Math.abs(track.scrollLeft); }
  function currentIndex() {
    var best = 0;
    positions.forEach(function (p, i) {
      if (Math.abs(p - distance()) < Math.abs(positions[best] - distance())) best = i;
    });
    return best;
  }
  function goTo(i) {
    track.classList.remove('is-mouse-scrolling');
    i = Math.max(0, Math.min(positions.length - 1, i));
    track.scrollTo({left: (RTL ? -1 : 1) * positions[i], behavior: reduce.matches ? 'instant' : 'smooth'});
  }
  function sync() {
    var i = currentIndex();
    dots.forEach(function (d, n) { d.setAttribute('aria-current', n === i ? 'true' : 'false'); });
    if (prevBtn) prevBtn.disabled = distance() <= 1;
    if (nextBtn) nextBtn.disabled = distance() >= track.scrollWidth - track.clientWidth - 1;
  }
  function buildDots() {
    var first = slides[0].getBoundingClientRect();
    var max = Math.max(0, track.scrollWidth - track.clientWidth);
    positions = [];
    slides.forEach(function (slide) {
      var rect = slide.getBoundingClientRect();
      var p = Math.min(max, Math.max(0, RTL ? first.right - rect.right : rect.left - first.left));
      if (!positions.length || Math.abs(p - positions[positions.length - 1]) > 1) positions.push(p);
    });
    if (!dotsBox) return;
    dotsBox.textContent = '';
    dots = [];
    dotsBox.hidden = positions.length < 2;
    positions.forEach(function (p, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'wp-dot';
      d.setAttribute('aria-label', '\u0627\u0644\u0627\u0646\u062a\u0642\u0627\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629 ' + (i + 1) + ' / ' + positions.length);
      d.setAttribute('aria-controls', track.id);
      d.addEventListener('click', function () { goTo(i); });
      dotsBox.appendChild(d);
      dots.push(d);
    });
  }
  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(currentIndex() - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(currentIndex() + 1); });
  track.addEventListener('keydown', function (e) {
    var i = currentIndex();
    if (e.key === 'ArrowLeft') i += RTL ? 1 : -1;
    else if (e.key === 'ArrowRight') i += RTL ? -1 : 1;
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = positions.length - 1;
    else return;
    e.preventDefault();
    goTo(i);
  });
  // Disable snapping during mouse dragging to preserve the exact drag position.
  function beginMouseScroll() {
    track.classList.add('is-mouse-scrolling');
  }
  function endMouseScroll() {
    // Keep the exact mouse position instead of snapping back after each gesture.
    sync();
  }


  // Mouse dragging moves the cards; the mouse wheel keeps normal page scrolling.
  var drag = null, suppressClick = false;
  track.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') {
      track.classList.remove('is-mouse-scrolling');
      return;
    }
    if (e.button !== 0) return;
    suppressClick = false;
    drag = {id: e.pointerId, x: e.clientX, left: track.scrollLeft, moved: false};
  });
  track.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      track.setPointerCapture(e.pointerId);
      beginMouseScroll();
      track.classList.add('is-dragging');
    }
    track.scrollTo({left: drag.left - dx, behavior: 'instant'});
  });
  function finishDrag() {
    if (!drag) return;
    suppressClick = drag.moved;
    drag = null;
    track.classList.remove('is-dragging');
    endMouseScroll();
  }
  window.addEventListener('pointerup', finishDrag);
  window.addEventListener('pointercancel', finishDrag);
  track.addEventListener('lostpointercapture', finishDrag);
  track.addEventListener('dragstart', function (e) { e.preventDefault(); });
  track.addEventListener('click', function (e) {
    if (!suppressClick) return;
    e.preventDefault();
    e.stopPropagation();
    suppressClick = false;
  }, true);
  var raf;
  track.addEventListener('scroll', function () {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(sync);
  }, { passive: true });
  slides.forEach(function (slide, i) {
    var link = slide.querySelector('.wp-navsvc-more');
    if (link) link.addEventListener('focus', function () { goTo(i); });
  });
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { buildDots(); sync(); }, 150);
  });
  buildDots();
  sync();
})();
(function () {
  'use strict';
  function initPageReveals() {
    var preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

    var selector = [
      'main .wp-h2', 'main .wp-lead', 'main .wp-trust-item',
      'main .wp-prob', 'main .wp-ramp-step', 'main .wp-h3',
      'main .wp-benefits > li', 'main .wp-choose-item', 'main .wp-mistake',
      'main .wp-factor', 'main .wp-price-note', 'main .wp-cta-row',
      'main .wp-faq > details', 'main .wp-navsvc-head',
      'main .wp-navsvc-track', 'main .wp-dots',
      '#site-footer .rs-footer-widget', '#site-footer .rs-footer-copyright-area'
    ].join(',');
    var elements = Array.prototype.slice.call(document.querySelectorAll(selector));
    var animations = new Map();
    function show(element, immediate) {
      if (element.getAttribute('data-wp-reveal') !== 'pending') return;
      element.setAttribute('data-wp-reveal', 'visible');
      observer.unobserve(element);
      if (immediate || preference.matches) return;
      var siblings = Array.prototype.filter.call(element.parentElement.children, function (child) {
        return child.hasAttribute('data-wp-reveal');
      });
      var delay = Math.min(Math.max(0, siblings.indexOf(element)), 4) * 65;
      var animation = element.animate([
        {opacity: 0, translate: '0 30px'},
        {opacity: 1, translate: '0 0'}
      ], {duration: 750, delay: delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'});
      animations.set(element, animation);
      animation.onfinish = function () { animations.delete(element); };
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) show(entry.target, false);
      });
    }, {threshold: 0, rootMargin: '0px 0px -8% 0px'});

    elements.forEach(function (element) {
      // Do not hide content already above the viewport on a restored scroll position.
      if (element.getBoundingClientRect().bottom < 0) return;
      element.setAttribute('data-wp-reveal', 'pending');
      observer.observe(element);
    });
    document.addEventListener('focusin', function (event) {
      elements.forEach(function (element) {
        if (!element.contains(event.target)) return;
        show(element, true);
        var animation = animations.get(element);
        if (animation) { animation.cancel(); animations.delete(element); }
      });
    });
    function revealImmediately() {
      observer.disconnect();
      elements.forEach(function (element) { show(element, true); });
      animations.forEach(function (animation) { animation.cancel(); });
      animations.clear();
    }
    preference.addEventListener('change', function () {
      if (preference.matches) revealImmediately();
    });
    window.addEventListener('beforeprint', revealImmediately);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageReveals, {once: true});
  } else {
    initPageReveals();
  }
})();
(function () {
  'use strict';
  function initStats() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var paint = function (el, v) {
      el.textContent = (el.getAttribute('data-prefix') || '') + v + (el.getAttribute('data-suffix') || '');
    };
    var counters = document.querySelectorAll('[data-count-to]');
    var reveals = document.querySelectorAll('.wp-stats[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }
    function countUp(el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10), duration = 1400, t0 = null, done = false;
      if (isNaN(target)) return;
      function finish() { if (!done) { done = true; paint(el, target); } }
      function frame(now) {
        if (done) return;
        if (t0 === null) t0 = now;
        var p = Math.min((now - t0) / duration, 1);
        paint(el, Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(frame); else finish();
      }
      requestAnimationFrame(frame);
      setTimeout(finish, duration + 150);
    }
    counters.forEach(function (el) { paint(el, 0); });
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-revealed');
        revealObs.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { revealObs.observe(el); });
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countUp(e.target);
        countObs.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObs.observe(el); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStats, {once: true});
  } else initStats();
})();
