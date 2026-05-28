/* Live GitHub contributions — builds a monochrome heat grid.
   Data: github-contributions-api.jogruber.de (public, CORS-enabled).
   Fallback: grayscale ghchart image if the API is unreachable.        */
(function () {
  function build(rootId, user) {
    var root = document.getElementById(rootId);
    if (!root) return;
    var cal = root.querySelector('[data-cal]');
    var totalEl = root.querySelector('[data-total]');
    var noteEl = root.querySelector('[data-note]');

    var api = 'https://github-contributions-api.jogruber.de/v4/' + user + '?y=last';

    fetch(api)
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (data) {
        var days = (data.contributions || []).slice();
        if (!days.length) throw new Error('empty');

        // keep ~53 weeks
        if (days.length > 371) days = days.slice(days.length - 371);

        var total = 0;
        days.forEach(function (d) { total += (d.count || 0); });

        // pad leading cells so first day lands on its weekday row (0=Sun)
        var firstDow = new Date(days[0].date + 'T00:00:00').getDay();
        var frag = document.createDocumentFragment();
        for (var p = 0; p < firstDow; p++) {
          var pad = document.createElement('div');
          pad.className = 'cal-cell';
          pad.style.visibility = 'hidden';
          frag.appendChild(pad);
        }
        days.forEach(function (d) {
          var cell = document.createElement('div');
          cell.className = 'cal-cell';
          cell.setAttribute('data-lvl', String(d.level || 0));
          var dt = new Date(d.date + 'T00:00:00');
          var label = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          cell.title = (d.count || 0) + (d.count === 1 ? ' contribution' : ' contributions') + ' on ' + label;
          frag.appendChild(cell);
        });

        cal.innerHTML = '';
        cal.appendChild(frag);
        if (totalEl) totalEl.textContent = total.toLocaleString();
        if (noteEl) noteEl.textContent = 'past 12 months · live from github';

        // scroll grid to the most recent weeks
        var sc = cal.closest('.cal-scroll');
        if (sc) sc.scrollLeft = sc.scrollWidth;
      })
      .catch(function () {
        if (totalEl) totalEl.textContent = '—';
        if (noteEl) noteEl.textContent = 'snapshot';
        if (cal) {
          cal.style.minWidth = '0';
          var img = document.createElement('img');
          img.className = 'cal-fallback';
          img.alt = 'GitHub contribution graph for ' + user;
          img.loading = 'lazy';
          img.src = 'https://ghchart.rshah.org/4a4744/' + user;
          cal.parentNode.replaceChild(img, cal);
        }
      });
  }

  window.buildContributions = build;
})();
