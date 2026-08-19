/* Design exploration for the mockups — two independent axes:

     data-theme  → the palette          (assets/themes.css)
     data-style  → type, shape, density (assets/styles.css)

   Loaded in <head> and run synchronously so both are set before first paint
   (no flash of the wrong design). Mockup chrome only — the real site ships
   one combination.

   Precedence per axis: ?theme=/?style= in the URL, then the last choice in
   localStorage, then the default. localStorage is wrapped because file://
   pages throw on access in some browsers. */

var BBDesign = (function () {

  /* ------------------------------------------------------------ palettes */
  var THEMES = [
    {
      id: 'smarald', name: 'Smarald', num: '01',
      accent: '#1F5F4E', canvas: '#FAF8F5', ink: '#14110F',
      tagline: 'Off-white cald · smarald profund',
      why: 'Direcția actuală. Preia paleta nailart-studio.ro (off-white, negru-cald, taupe) și adaugă un accent propriu: verde smarald — creștere și bani, nu beauty de consum. Cea mai sigură legătură cu brandul-soră.',
      swatches: [
        ['canvas', '#FAF8F5'], ['sand', '#EDE6DD'], ['taupe', '#C9BCAE'],
        ['accent', '#1F5F4E'], ['accent-hi', '#2E7D66'], ['ink', '#14110F']
      ]
    },
    {
      id: 'teracota', name: 'Teracotă', num: '02',
      accent: '#9C4A22', canvas: '#FDF9F4', ink: '#1A1310',
      tagline: 'Nisip cald · aramă / lut',
      why: 'Cel mai cald și cel mai uman dintre cele cinci. Merge bine cu fotografie de studio și cu tonul „am făcut asta cu mâna mea”. Riscul: stă mai aproape de „interior de salon” decât de „educație de business”.',
      swatches: [
        ['canvas', '#FDF9F4'], ['sand', '#F4E9DD'], ['taupe', '#CDB69F'],
        ['accent', '#9C4A22'], ['accent-hi', '#B85C2E'], ['ink', '#1A1310']
      ]
    },
    {
      id: 'pruna', name: 'Prună', num: '03',
      accent: '#6E1F3F', canvas: '#FBF7F7', ink: '#180F13',
      tagline: 'Ivoriu rece · vin profund',
      why: 'Cel mai editorial. Vinul profund citește premium și feminin fără să atingă roz, iar canvasul ușor rozat leagă paleta fără să o îndulcească. Cel mai potrivit pentru mentorat și pentru prețuri mari.',
      swatches: [
        ['canvas', '#FBF7F7'], ['sand', '#F0E6E8'], ['taupe', '#C4ADB1'],
        ['accent', '#6E1F3F'], ['accent-hi', '#8C2B52'], ['ink', '#180F13']
      ]
    },
    {
      id: 'bleumarin', name: 'Bleumarin & alamă', num: '04',
      accent: '#1B3A6B', canvas: '#F7F6F2', ink: '#101720',
      tagline: 'Ivoriu neutru · bleumarin + alamă',
      why: 'Registrul „școală de business”: autoritate, cifre, seriozitate. Neutrul nu e gri, e alamă — el ține footerul și accentele calde. Cea mai sigură alegere pentru un site care vinde programe plătite, dar cea mai slabă legătură cu brandul-soră.',
      swatches: [
        ['canvas', '#F7F6F2'], ['sand', '#E9E7DE'], ['alamă', '#B79A62'],
        ['accent', '#1B3A6B'], ['accent-hi', '#2A5490'], ['ink', '#101720']
      ]
    },
    {
      id: 'noir', name: 'Noir & șampanie', num: '05',
      accent: '#D8B98A', canvas: '#121010', ink: '#F5F1EA',
      tagline: 'Canvas închis · șampanie',
      why: 'Singura direcție care inversează valoarea. Cea mai distinctivă și cea mai „luxury”, dar cere fotografie făcută pentru fundal închis, iar textul lung de curs se citește mai greu. De testat pe pagina de curs, nu doar pe home.',
      swatches: [
        ['canvas', '#121010'], ['surface', '#1A1716'], ['taupe', '#8A7F72'],
        ['accent', '#D8B98A'], ['accent-hi', '#EBD0A6'], ['ink', '#F5F1EA']
      ]
    },
    {
      id: 'pastel', name: 'Teracotă pastel', num: '06',
      accent: '#A94D24', canvas: '#FFFFFF', ink: '#131010',
      tagline: 'Alb pur · cremă · lut pastel + galben',
      why: 'Direcția aleasă de client. Aceeași familie de lut ca 02 Teracotă, dar pastelată: fundalul devine alb pur, benzile de secțiune devin cremă, iar un galben cald intră ca al doilea accent, pentru contrast. Textul e negru pe alb peste tot — culoarea o duc benzile și accentele, niciodată paragraful.',
      swatches: [
        ['canvas', '#FFFFFF'], ['cremă', '#FBF2E8'], ['galben', '#FDF4DE'],
        ['zest', '#E3A32B'], ['accent', '#A94D24'], ['ink', '#131010']
      ]
    }
  ];

  /* -------------------------------------------------------------- styles */
  /* `traits` are the four decisions that actually separate the styles —
     shown as a spec table on stiluri.html so the client compares like for
     like instead of reacting to the sample copy. */
  var STYLES = [
    {
      id: 'editorial', name: 'Editorial', num: '01',
      theme: 'smarald', page: 'design-1.html',
      layout: 'Hero split cu portret full-bleed · ticker de cifre · program principal cu draperie · grilă de 3 carduri · carusel de testimoniale',
      tagline: 'Serif de titlu · sans de text · linii subțiri',
      why: 'Direcția actuală. Serif la titluri, sans la corp, colțuri aproape drepte, carduri delimitate de o linie de 1px. Registrul e „revistă de business”: serios, dens, potrivit pentru pagini de curs cu mult text. Cea mai sigură, cea mai puțin memorabilă.',
      traits: { 'Titluri': 'Serif, 600', 'Colțuri': '2px — practic drepte', 'Carduri': 'Chenar 1px, fundal alb', 'Butoane': 'Dreptunghi, majuscule' },
      risk: 'Nu greșește nimic și nu reține nimic. Dacă tot ce contează e claritatea, e alegerea corectă.'
    },
    {
      id: 'swiss', name: 'Swiss / Grotesk', num: '02',
      theme: 'bleumarin', page: 'design-2.html',
      layout: 'Fără fotografie în hero · bandă de cifre pe 4 coloane · programele ca TABEL, nu ca grilă · pași lipiți la scroll · citate pe 3 coloane',
      tagline: 'Un singur sans · zero colțuri · grilă vizibilă',
      why: 'Fără serif deloc. Titluri mari, tracking negativ, colțuri 0, iar cardurile dispar ca obiecte: rămân doar liniile de grilă și o bară de accent deasupra. Structura devine decorul. Foarte bun pentru hub-uri și tabele de comparație.',
      traits: { 'Titluri': 'Sans, tracking −3%', 'Colțuri': '0 — tăiate', 'Carduri': 'Fără chenar, linie 2px sus', 'Butoane': 'Dreptunghi, literă mică' },
      risk: 'Rece. Are nevoie de fotografie caldă ca să nu pară un raport financiar.'
    },
    {
      id: 'soft', name: 'Soft / Modern', num: '03',
      theme: 'teracota', page: 'design-3.html',
      layout: 'Hero centrat cu vizual dedesubt · panouri care se deschid la hover · carduri în carusel · calculator interactiv în pagină · FAQ · card de CTA',
      tagline: 'Rotunjit · umbre difuze · pastile',
      why: 'Registrul de aplicație modernă: colțuri de 20px, butoane-pastilă, umbre difuze în loc de chenare, carduri care se ridică la hover. Cel mai prietenos și cel mai „digital”. Reduce percepția de preț, dar crește rata de click.',
      traits: { 'Titluri': 'Sans, 700', 'Colțuri': '20px', 'Carduri': 'Fără chenar, umbră difuză', 'Butoane': 'Pastilă, literă mică' },
      risk: 'Seamănă cu orice SaaS. Greu de diferențiat de concurență și de brandul-soră.'
    },
    {
      id: 'couture', name: 'Couture', num: '04',
      theme: 'pruna', page: 'design-4.html',
      layout: 'Hero imagine pe tot ecranul cu text suprapus · logo centrat · programele ca index tipografic mare · citat full-bleed · secțiune de mentorat, nu de vânzare',
      tagline: 'Serif cu contrast mare · spațiere largă · minim',
      why: 'Serif de modă la greutate mică și dimensiune mare, eyebrow-uri cu tracking foarte larg, butoane doar contur, secțiuni cu de două ori mai mult aer. Totul e mai mic, în afară de titluri. Registrul „preț la cerere”.',
      traits: { 'Titluri': 'Serif contrast, 400', 'Colțuri': '0', 'Carduri': 'Fără fundal, linie sus', 'Butoane': 'Doar contur, tracking .22em' },
      risk: 'Aerul costă scroll. Pe pagina de curs, unde e mult text, devine obositor.'
    },
    {
      id: 'bold', name: 'Bold / Editorial gros', num: '05',
      theme: 'noir', page: 'design-5.html',
      layout: 'Titlu supradimensionat peste toată lățimea · ticker · problema ca blocuri numerotate uriașe · carduri cu umbră decalată · citat-poster · CTA zgomotos',
      tagline: 'Sans greu · chenare 2px · umbre decalate',
      why: 'Titluri foarte mari la greutate 800, chenare de 2px, umbre solide decalate, eyebrow-uri ca etichete pline. Cel mai memorabil dintre cele cinci și cel mai apropiat de tonul „ai talentul, îți lipsește sistemul”.',
      traits: { 'Titluri': 'Sans, 800, tracking −4%', 'Colțuri': '0', 'Carduri': 'Chenar 2px + umbră 6px', 'Butoane': 'Chenar 2px + umbră' },
      risk: 'Puternic pe home, agresiv pe checkout. De verificat pe pagina de curs înainte de decizie.'
    },
    {
      id: 'dream', name: 'Client Dream', num: '06',
      theme: 'pastel', page: 'design-6.html',
      layout: 'Hero split pe jumătate de pagină · bandă galbenă de cifre · „Patru feluri" ca panouri · programele în carusel · comparație înainte/după pe jumătate de pagină · calculatorul funcțional în pagină · podcast în stil listă (ca growmysalonbusiness)',
      tagline: 'Serif contrast 400 · colțuri 0 · butoane doar contur',
      why: 'Compusă din ce a reținut clientul, nu inventată: tipografia și butoanele de la 04 Couture (serif de contrast la 400, buton doar contur, tracking .22em), cardurile de la 03 Soft (fără chenar, umbră difuză), paleta de la 02 Teracotă adusă în pastel, colțuri 0 peste tot și blocurile pe care le-a adoptat deja — „Patru feluri în care poți lucra cu noi", „Programe pentru fiecare etapă", „Câștigul tău real pe oră" și „Aceeași agendă, alt rezultat".',
      traits: { 'Titluri': 'Serif contrast, 400', 'Colțuri': '0 — peste tot', 'Carduri': 'Fără chenar, umbră difuză', 'Butoane': 'Doar contur, tracking .22em' },
      risk: 'Serif de contrast la 400 cere dimensiune mare ca să nu se subțieze — pe titlurile mici din carduri rămâne sans. Iar galbenul nu are contrast pe alb: e folosit doar ca bandă și ca subliniere, niciodată ca text.'
    }
  ];

  var AXES = {
    theme: { key: 'bb-theme', attr: 'data-theme', def: 'smarald', items: THEMES },
    style: { key: 'bb-style', attr: 'data-style', def: 'editorial',            items: STYLES }
  };

  function read(k)      { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v)  { try { localStorage.setItem(k, v); } catch (e) {} }

  function valid(axis, id) {
    var items = AXES[axis].items;
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return id;
    return null;
  }

  function current(axis) {
    return document.documentElement.getAttribute(AXES[axis].attr) || AXES[axis].def;
  }

  function apply(axis, id, persist) {
    var a = AXES[axis];
    id = valid(axis, id) || a.def;
    document.documentElement.setAttribute(a.attr, id);
    if (persist !== false) write(a.key, id);
    document.dispatchEvent(new CustomEvent('bb:design', { detail: { axis: axis, id: id } }));
    return id;
  }

  /* Combination of both axes as a query string — used by every "open this in
     a real page" link so the other axis is never silently reset. */
  function href(page, over) {
    over = over || {};
    return page + '?theme=' + (over.theme || current('theme')) +
                  '&style=' + (over.style || current('style'));
  }

  /* runs immediately, before <body> exists */
  var params = null;
  try { params = new URLSearchParams(location.search); } catch (e) {}
  Object.keys(AXES).forEach(function (axis) {
    var a = AXES[axis];
    var q = params && valid(axis, params.get(axis));
    document.documentElement.setAttribute(a.attr, q || valid(axis, read(a.key)) || a.def);
    if (q) write(a.key, q);
  });

  return {
    THEMES: THEMES, STYLES: STYLES, AXES: AXES,
    apply: apply, current: current, href: href, valid: valid
  };
})();
