/* Senva website: menu, section highlighting and the waiting-list form. No tracking. */
(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  // Menu button on small screens
  if (header && toggle && nav) {
    var label = toggle.querySelector('.nav-toggle-label');
    var setOpen = function (open) {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? 'Close' : 'Menu';
    };
    toggle.addEventListener('click', function () {
      setOpen(!header.classList.contains('is-open'));
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && header.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (event) {
      if (header.classList.contains('is-open') && !header.contains(event.target)) setOpen(false);
    });
    var wide = window.matchMedia('(min-width: 1041px)');
    var closeOnWide = function () { if (wide.matches) setOpen(false); };
    if (wide.addEventListener) wide.addEventListener('change', closeOnWide);
  }

  // Highlight the menu item for the section in view (home page only)
  if (nav && 'IntersectionObserver' in window) {
    var links = {};
    Array.prototype.forEach.call(nav.querySelectorAll('a[href^="#"]'), function (link) {
      links[link.getAttribute('href').slice(1)] = link;
    });
    var sections = document.querySelectorAll('main section[id]');
    if (sections.length) {
      var current = null;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          if (current) current.classList.remove('is-current');
          current = links[entry.target.id] || null;
          if (current && current.classList.contains('nav-cta')) current = null;
          if (current) current.classList.add('is-current');
        });
      }, { rootMargin: '-35% 0px -60% 0px' });
      Array.prototype.forEach.call(sections, function (section) { observer.observe(section); });
    }
  }

  // Waiting-list form: send to Formspree without leaving the page
  var form = document.getElementById('signup-form');
  if (!form || !window.fetch) return;
  var status = form.querySelector('.form-status');
  var button = form.querySelector('button[type="submit"]');
  var thanks = document.getElementById('signup-thanks');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    status.textContent = '';
    status.className = 'form-status';
    if (!form.checkValidity()) {
      var firstInvalid = form.querySelector(':invalid');
      if (firstInvalid && firstInvalid.name === 'consent') {
        status.textContent = 'Tick the box to confirm we may email you.';
      } else {
        status.textContent = 'Add your name and a valid email address.';
      }
      status.classList.add('error');
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    button.disabled = true;
    button.textContent = 'Joining…';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(function (response) {
        if (!response.ok) throw new Error('Request failed');
        form.hidden = true;
        thanks.hidden = false;
        thanks.focus();
      })
      .catch(function () {
        status.textContent = 'You weren’t added, because the form couldn’t be sent. Try again, or email anton.carcedo@umu.se.';
        status.classList.add('error');
        button.disabled = false;
        button.textContent = 'Join the waiting list';
      });
  });
})();
