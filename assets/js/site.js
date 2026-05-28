/* shared interactions: sticky nav shadow, mobile menu, reveal-on-scroll */
(function () {
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    var sync = function () { toggle.setAttribute('aria-expanded', links.classList.contains('open') ? 'true' : 'false'); };
    toggle.addEventListener('click', function () { links.classList.toggle('open'); sync(); });
    links.addEventListener('click', function (e) { if (e.target.tagName === 'A') { links.classList.remove('open'); sync(); } });
    sync();
  }

  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  var strip = function () { reveals.forEach(function (el) { el.classList.add('in'); el.classList.remove('reveal'); }); };

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    var initial = function () {
      reveals.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < (window.innerHeight || 800) * 0.96) el.classList.add('in');
      });
    };
    initial();
    window.addEventListener('load', initial);
    // failsafe: guarantee final visible state even where transitions never paint
    // (offscreen/background tabs, capture tools) — strips the hidden base entirely
    setTimeout(strip, 2000);
  } else {
    strip();
  }
  window.__siteLoaded = true;
})();
