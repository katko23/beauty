/* Shared mockup chrome: demo bar, site header, site footer.
   Injected by JS so the mockups stay standalone files with no build step
   and no fetch() (which file:// blocks). Set <body data-page="..."> to
   highlight the current page in the demo bar. */

(function () {
  var PAGES = [
    { id: 'home',       href: 'index.html',       label: 'Home' },
    { id: 'freelanceri',href: 'freelanceri.html', label: 'Hub Freelanceri' },
    { id: 'curs',       href: 'curs.html',        label: 'Pagină curs' },
    { id: 'quiz',       href: 'quiz.html',        label: 'Quiz' },
    { id: 'podcast',    href: 'podcast.html',     label: 'Podcast' },
    { id: 'gratuitati', href: 'gratuitati.html',  label: 'Gratuități' },
    { id: 'blocks',     href: 'blocks.html',      label: 'Blocuri ✦' },
    { id: 'directii',   href: 'directii.html',    label: 'Direcții ✦✦' },
    { id: 'teme',       href: 'teme.html',        label: 'Culori ✦' },
    { id: 'admin',      href: 'admin.html',       label: 'Admin' }
  ];

  var current = document.body.getAttribute('data-page');

  var mockbar =
    '<div class="mockbar">' +
      '<strong>Mockup</strong>' +
      PAGES.map(function (p) {
        return '<a href="' + p.href + '"' +
          (p.id === current ? ' aria-current="page"' : '') + '>' + p.label + '</a>';
      }).join('') +
      '<span style="margin-left:auto">static HTML/JS · fără backend</span>' +
    '</div>';

  var header =
    '<header class="hdr">' +
      '<div class="wrap hdr__in">' +
        '<a class="hdr__logo" href="index.html">beauty<span>business</span>.ro</a>' +
        '<nav class="hdr__nav">' +
          '<div class="hdr__drop">' +
            '<button type="button">Programe ▾</button>' +
            '<ul>' +
              '<li><a href="freelanceri.html">Pentru freelanceri</a></li>' +
              '<li><a href="freelanceri.html">Pentru proprietari de salon</a></li>' +
            '</ul>' +
          '</div>' +
          '<a href="#">Mentorat</a>' +
          '<a href="podcast.html">Podcast</a>' +
          '<a href="gratuitati.html">Gratuități</a>' +
          '<a href="#">Membership</a>' +
          '<a href="#">Consultanță 1:1</a>' +
          '<a href="#" style="color:var(--ink-mute)">Cont</a>' +
          '<a class="btn btn--primary btn--sm" href="freelanceri.html">Explorează programele</a>' +
        '</nav>' +
      '</div>' +
    '</header>';

  var footer =
    '<footer class="ftr">' +
      '<div class="wrap">' +
        '<div class="grid grid-4">' +
          '<div><h4>Învață</h4><ul>' +
            '<li><a href="freelanceri.html">Programe Freelanceri</a></li>' +
            '<li><a href="#">Programe Salon</a></li>' +
            '<li><a href="#">Mentorat</a></li>' +
            '<li><a href="#">Membership</a></li>' +
            '<li><a href="#">Consultanță 1:1</a></li>' +
          '</ul></div>' +
          '<div><h4>Explorează</h4><ul>' +
            '<li><a href="podcast.html">Podcast</a></li>' +
            '<li><a href="gratuitati.html">Gratuități</a></li>' +
            '<li><a href="quiz.html">Test: ce program ți se potrivește</a></li>' +
            '<li><a href="#">Testimoniale</a></li>' +
          '</ul></div>' +
          '<div><h4>Conectează-te</h4><ul>' +
            '<li><a href="#">Despre Lore</a></li>' +
            '<li><a href="#">Contact</a></li>' +
            '<li><a href="#">Instagram</a></li>' +
            '<li><a href="#">YouTube</a></li>' +
            '<li><a href="#">TikTok</a></li>' +
          '</ul></div>' +
          '<div><h4>Legal</h4><ul>' +
            '<li><a href="#">Politică de confidențialitate</a></li>' +
            '<li><a href="#">Termeni și condiții</a></li>' +
            '<li><a href="#">Cookies</a></li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="ftr__news">' +
          '<div class="grid grid-2" style="align-items:center">' +
            '<div>' +
              '<h4 style="margin-bottom:.5rem">Newsletter</h4>' +
              '<p style="margin:0;font-size:.875rem">Resurse gratuite pentru profesioniștii beauty. Fără spam.</p>' +
            '</div>' +
            '<form class="form-inline" onsubmit="return false">' +
              '<div class="field"><input type="email" placeholder="Adresa ta de email" aria-label="Email"></div>' +
              '<button class="btn btn--onDark" type="submit">Vreau resurse gratuite</button>' +
            '</form>' +
          '</div>' +
          '<p class="ftr__legal">© 2026 Beauty Business · Lore Zagon · Mockup — conținut demonstrativ</p>' +
        '</div>' +
      '</div>' +
    '</footer>';

  var top = document.getElementById('chrome-top');
  if (top) top.outerHTML = mockbar + header;

  var foot = document.getElementById('chrome-foot');
  if (foot) foot.outerHTML = footer;

  /* ---- design switcher (mockup chrome only) ----------------------------
     Two axes: palette and style. Floating pill, bottom right. Skipped on the
     gallery pages, which show every option at once. */
  if (typeof BBDesign !== 'undefined' &&
      !document.body.hasAttribute('data-no-theme-switcher')) {

    function axisHTML(axis, label, render) {
      return '<span class="tsw__axis"><span class="tsw__lbl">' + label + '</span>' +
        '<span class="tsw__opts">' +
          BBDesign[axis === 'theme' ? 'THEMES' : 'STYLES'].map(function (o) {
            return render(o, o.id === BBDesign.current(axis));
          }).join('') +
        '</span></span>';
    }

    var sw = document.createElement('div');
    sw.className = 'tsw';
    sw.setAttribute('role', 'group');
    sw.setAttribute('aria-label', 'Direcție de design');
    sw.innerHTML =
      axisHTML('theme', 'Culoare', function (t, on) {
        return '<button type="button" class="tsw__opt" data-axis="theme" data-id="' + t.id + '"' +
          ' title="' + t.name + ' — ' + t.tagline + '" aria-label="' + t.name + '"' +
          ' aria-pressed="' + on + '"' +
          ' style="background:' + t.accent + ';--sw-canvas:' + t.canvas + '"></button>';
      }) +
      axisHTML('style', 'Stil', function (st, on) {
        return '<button type="button" class="tsw__txt" data-axis="style" data-id="' + st.id + '"' +
          ' title="' + st.name + ' — ' + st.tagline + '" aria-pressed="' + on + '">' +
          st.num + '</button>';
      }) +
      '<a class="tsw__more" href="directii.html">direcții ↗</a>';

    sw.addEventListener('click', function (e) {
      var b = e.target.closest('[data-axis]');
      if (!b) return;
      BBDesign.apply(b.getAttribute('data-axis'), b.getAttribute('data-id'));
    });

    document.addEventListener('bb:design', function (e) {
      sw.querySelectorAll('[data-axis="' + e.detail.axis + '"]').forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-id') === e.detail.id);
      });
    });

    document.body.appendChild(sw);
  }

  /* accordion behaviour, used by the course page */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.acc__btn');
    if (!btn) return;
    var item = btn.closest('.acc__item');
    item.setAttribute('data-open', item.getAttribute('data-open') === 'true' ? 'false' : 'true');
  });
})();
