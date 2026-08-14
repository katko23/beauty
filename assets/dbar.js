/* Bar that switches between the five full design directions.
   Mockup chrome only. The design pages are fixed combinations — they set
   data-theme/data-style on <html> themselves and deliberately do NOT read
   the switcher state, so each one is judged as a finished design. */

(function () {
  var D = [
    { n: '01', id: 'design-1.html', label: 'Editorial',  hint: 'smarald · serif' },
    { n: '02', id: 'design-2.html', label: 'Swiss',      hint: 'bleumarin · grotesk' },
    { n: '03', id: 'design-3.html', label: 'Soft',       hint: 'teracotă · rotunjit' },
    { n: '04', id: 'design-4.html', label: 'Couture',    hint: 'prună · minimal' },
    { n: '05', id: 'design-5.html', label: 'Bold',       hint: 'noir · gros' }
  ];

  var here = location.pathname.split('/').pop() || 'index.html';

  /* directii.html renders these pages inside scaled iframes as thumbnails —
     the bar would just be noise there. */
  if (/[?&]preview=1/.test(location.search)) return;

  var bar = document.createElement('div');
  bar.className = 'dbar';
  bar.innerHTML =
    '<a class="dbar__home" href="directii.html">← Toate direcțiile</a>' +
    '<span class="dbar__set">' +
      D.map(function (d) {
        return '<a class="dbar__i" href="' + d.id + '"' +
          (d.id === here ? ' aria-current="page"' : '') + '>' +
          '<b>' + d.n + '</b> ' + d.label +
          '<em>' + d.hint + '</em></a>';
      }).join('') +
    '</span>' +
    '<a class="dbar__alt" href="index.html">Mockup complet ↗</a>';

  function mount() { document.body.insertBefore(bar, document.body.firstChild); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
