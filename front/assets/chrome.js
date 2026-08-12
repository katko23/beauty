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

  /* accordion behaviour, used by the course page */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.acc__btn');
    if (!btn) return;
    var item = btn.closest('.acc__item');
    item.setAttribute('data-open', item.getAttribute('data-open') === 'true' ? 'false' : 'true');
  });
})();
