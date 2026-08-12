/* ==========================================================================
   BB Platform — interactive block behaviours.
   Everything auto-initialises from data attributes. No dependencies.
   Blocks degrade to readable static content if this file never runs.
   ========================================================================== */

(function () {
  'use strict';

  document.documentElement.classList.add('ui-js');

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* ═══════════════════════════════════════════════ 1. SCROLL REVEAL ══ */
  function initReveal() {
    var els = $$('[data-reveal]');
    if (!els.length) return;

    if (REDUCED || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);           // reveal once, never flicker back
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });

    els.forEach(function (el, i) {
      // stagger siblings automatically unless an explicit --d is set
      if (!el.style.getPropertyValue('--d')) {
        var sibs = el.parentElement ? $$('[data-reveal]', el.parentElement) : [];
        var idx = sibs.indexOf(el);
        el.style.setProperty('--d', String(idx > -1 ? Math.min(idx, 5) : 0));
      }
      io.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════════════ 2. CAROUSEL ══ */
  var ARROW_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 4l-8 8 8 8"/></svg>';
  var ARROW_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 4l8 8-8 8"/></svg>';

  function initCarousels() {
    $$('[data-carousel]').forEach(function (root) {
      if (root.dataset.uiReady) return;
      var track = $('.crsl__track', root);
      if (!track) return;
      root.dataset.uiReady = '1';
      var slides = $$('.crsl__slide', track);
      if (slides.length < 2) return;

      var ctl = document.createElement('div');
      ctl.className = 'crsl__ctl';
      ctl.innerHTML =
        '<button class="crsl__btn" type="button" aria-label="Slide anterior">' + ARROW_L + '</button>' +
        '<button class="crsl__btn" type="button" aria-label="Slide următor">' + ARROW_R + '</button>' +
        '<div class="crsl__dots" role="tablist"></div>';
      root.appendChild(ctl);

      var prev = ctl.children[0], next = ctl.children[1], dotWrap = ctl.children[2];

      slides.forEach(function (s, i) {
        var d = document.createElement('button');
        d.className = 'crsl__dot';
        d.type = 'button';
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', 'Slide ' + (i + 1));
        d.onclick = function () { goTo(i); };
        dotWrap.appendChild(d);
      });
      var dots = $$('.crsl__dot', dotWrap);

      function step() {
        // distance between two slide starts, gap included
        if (slides.length < 2) return slides[0].offsetWidth;
        return slides[1].offsetLeft - slides[0].offsetLeft;
      }
      function index() {
        var s = step();
        return s ? Math.round(track.scrollLeft / s) : 0;
      }
      function goTo(i) {
        track.scrollTo({ left: i * step(), behavior: REDUCED ? 'auto' : 'smooth' });
      }

      prev.onclick = function () { goTo(Math.max(index() - 1, 0)); };
      next.onclick = function () { goTo(Math.min(index() + 1, slides.length - 1)); };

      var raf;
      function sync() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var i = index();
          dots.forEach(function (d, n) { d.setAttribute('aria-current', String(n === i)); });
          prev.disabled = track.scrollLeft <= 2;
          next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
        });
      }
      track.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      sync();

      // keyboard support when the track has focus
      track.tabIndex = 0;
      track.setAttribute('aria-label', root.getAttribute('data-carousel') || 'Carusel');
      track.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); prev.click(); }
      });

      // pointer drag on desktop (touch already scrolls natively)
      var down = false, startX = 0, startLeft = 0, moved = false;
      track.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return;
        down = true; moved = false;
        startX = e.clientX; startLeft = track.scrollLeft;
        track.style.scrollBehavior = 'auto';
      });
      track.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        track.scrollLeft = startLeft - dx;
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
        track.addEventListener(ev, function () {
          if (!down) return;
          down = false;
          track.style.scrollBehavior = '';
          if (moved) goTo(index());        // settle on the nearest slide
        });
      });
      track.addEventListener('click', function (e) {
        if (moved) { e.preventDefault(); e.stopPropagation(); }
      }, true);
    });
  }

  /* ═══════════════════════════════════════════════ 3. CURTAIN REVEAL ══ */
  function initCurtains() {
    $$('[data-curtain]').forEach(function (root) {
      if (root.dataset.uiReady) return;
      root.dataset.uiReady = '1';
      var trigger = $('.curtain__trigger', root);
      var closeBtn = $('.curtain__close', root);
      var leaves = $$('.curtain__leaf', root);

      function set(open) {
        root.setAttribute('data-open', String(open));
        if (trigger) trigger.setAttribute('aria-expanded', String(open));
        // when open, the panel behind takes focus order
        var back = $('.curtain__back', root);
        if (back) back.setAttribute('aria-hidden', String(!open));
      }
      set(root.getAttribute('data-open') === 'true');

      function toggle() { set(root.getAttribute('data-open') !== 'true'); }

      if (trigger) trigger.addEventListener('click', toggle);
      leaves.forEach(function (l) { l.addEventListener('click', toggle); });
      if (closeBtn) closeBtn.addEventListener('click', function () { set(false); });

      root.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && root.getAttribute('data-open') === 'true') set(false);
      });

      // open automatically when scrolled into view, if asked to
      if (root.hasAttribute('data-curtain-auto') && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { set(true); io.disconnect(); }
          });
        }, { threshold: .55 });
        io.observe(root);
      }
    });
  }

  /* ═══════════════════════════════════════════════ 4. BEFORE / AFTER ══ */
  function initCompare() {
    $$('[data-compare]').forEach(function (root) {
      if (root.dataset.uiReady) return;
      var range = $('.cmp__range', root);
      if (!range) return;
      root.dataset.uiReady = '1';
      function apply() { root.style.setProperty('--pos', range.value + '%'); }
      range.addEventListener('input', apply);
      apply();
    });
  }

  /* ══════════════════════════════════════════════ 5. EXPANDING PANELS ══ */
  function initPanels() {
    $$('[data-panels]').forEach(function (root) {
      if (root.dataset.uiReady) return;
      var panels = $$('.panel', root);
      if (!panels.length) return;
      root.dataset.uiReady = '1';

      function activate(p) {
        panels.forEach(function (x) {
          x.setAttribute('data-active', String(x === p));
          x.setAttribute('aria-expanded', String(x === p));
        });
      }
      panels.forEach(function (p) {
        p.tabIndex = 0;
        p.addEventListener('mouseenter', function () { activate(p); });
        p.addEventListener('click', function () { activate(p); });
        p.addEventListener('focus', function () { activate(p); });
        p.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(p); }
        });
      });
      activate(panels[0]);
    });
  }

  /* ═══════════════════════════════════════════════════════ 6. MARQUEE ══ */
  function initMarquee() {
    $$('[data-marquee]').forEach(function (root) {
      var inner = $('.mq__in', root);
      if (!inner || inner.dataset.cloned) return;
      inner.dataset.cloned = '1';
      inner.innerHTML += inner.innerHTML;   // duplicate for a seamless -50% loop
      var speed = Number(root.getAttribute('data-marquee')) || 34;
      inner.style.animationDuration = speed + 's';
    });
  }

  /* ══════════════════════════════════════════════════════ 7. COUNTERS ══ */
  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length) return;

    function run(el) {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-count-suffix') || '';
      var decimals = (String(target).split('.')[1] || '').length;

      if (REDUCED || isNaN(target)) { el.textContent = target + suffix; return; }

      var dur = 1400, t0 = null;
      function frame(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: .5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ═════════════════════════════════════════════════ 8. STICKY STEPS ══ */
  function initStickySteps() {
    $$('[data-sticky-steps]').forEach(function (root) {
      if (root.dataset.uiReady) return;
      root.dataset.uiReady = '1';
      var steps = $$('.step', root);
      var label = $('[data-step-label]', root);
      var frame = $('[data-step-visual]', root);
      if (!steps.length || !('IntersectionObserver' in window)) {
        steps.forEach(function (s) { s.classList.add('is-active'); });
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          steps.forEach(function (s) { s.classList.toggle('is-active', s === e.target); });
          if (label) label.textContent = e.target.getAttribute('data-step-name') || '';
          if (frame) frame.textContent = e.target.getAttribute('data-step-visual-text') || frame.textContent;
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      steps.forEach(function (s) { io.observe(s); });
    });
  }

  /* ═══════════════════════════════════════════════════════════ boot ══ */
  function init() {
    initReveal();
    initCarousels();
    initCurtains();
    initCompare();
    initPanels();
    initMarquee();
    initCounters();
    initStickySteps();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.UI = { init: init };
})();
