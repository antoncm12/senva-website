/* Senva website: menu, section highlighting, LinkedIn posts on request and the waiting-list forms. No cookies, no tracking. */
(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  // Old addresses of sections that moved or were renamed
  if (document.querySelector('.hero')) {
    var moved = { '#journey': 'about.html#journey', '#news': '#about', '#latest': '#about', '#team': '#about', '#model': '#different' };
    if (moved[location.hash]) location.replace(moved[location.hash]);
  }

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
      if (!link.classList.contains('nav-cta')) links[link.getAttribute('href').slice(1)] = link;
    });
    var sections = document.querySelectorAll('main section[id]');
    if (sections.length && Object.keys(links).length) {
      var current = null;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          if (current) current.classList.remove('is-current');
          current = links[entry.target.id] || null;
          if (current) current.classList.add('is-current');
        });
      }, { rootMargin: '-35% 0px -60% 0px' });
      Array.prototype.forEach.call(sections, function (section) { observer.observe(section); });
    }
  }

  // LinkedIn posts load only when the visitor asks, so LinkedIn can't set cookies before that
  Array.prototype.forEach.call(document.querySelectorAll('.li-post[data-embed]'), function (box) {
    var show = box.querySelector('button');
    if (!show) return;
    show.addEventListener('click', function () {
      var frame = document.createElement('iframe');
      frame.src = box.getAttribute('data-embed');
      frame.height = box.getAttribute('data-height') || '640';
      frame.title = 'LinkedIn post';
      frame.setAttribute('allowfullscreen', '');
      box.innerHTML = '';
      box.appendChild(frame);
      frame.focus();
    });
  });

  // Waiting-list forms: send to Formspree without leaving the page
  var forms = document.querySelectorAll('form.signup-form');
  if (!forms.length || !window.fetch || !window.FormData) return;

  // Where the visitor came from: campaign tags on the link (utm_...) and the site that linked here.
  // Read from this page's address only; nothing is stored on the visitor's device.
  var campaign = [];
  location.search.replace(/^\?/, '').split('&').forEach(function (pair) {
    var parts = pair.split('=');
    var key = decodeURIComponent(parts[0] || '');
    if (/^utm_(source|medium|campaign|content|term)$/.test(key) && parts[1]) {
      campaign.push(key.slice(4) + '=' + decodeURIComponent(parts[1].replace(/\+/g, ' ')).slice(0, 80));
    }
  });
  var referrer = '';
  try {
    if (document.referrer && new URL(document.referrer).host !== location.host) referrer = document.referrer.slice(0, 200);
  } catch (e) { referrer = ''; }

  Array.prototype.forEach.call(forms, function (form) {
    var status = form.querySelector('.form-status');
    var button = form.querySelector('button[type="submit"]');
    var buttonText = button ? button.textContent : '';
    var thanks = document.getElementById(form.getAttribute('data-thanks'));
    var fields = form.querySelectorAll('input[required]');
    var campaignField = form.querySelector('input[name="campaign"]');
    var referrerField = form.querySelector('input[name="referrer"]');
    if (campaignField) campaignField.value = campaign.join(', ');
    if (referrerField) referrerField.value = referrer;

    var clearInvalid = function (field) {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    };
    Array.prototype.forEach.call(fields, function (field) {
      field.addEventListener(field.type === 'checkbox' ? 'change' : 'input', function () {
        if (field.checkValidity()) clearInvalid(field);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      status.textContent = '';
      status.className = 'form-status';
      Array.prototype.forEach.call(fields, clearInvalid);
      if (!form.checkValidity()) {
        var invalid = form.querySelectorAll(':invalid');
        Array.prototype.forEach.call(invalid, function (field) {
          field.setAttribute('aria-invalid', 'true');
          if (status.id) field.setAttribute('aria-describedby', status.id);
        });
        var first = invalid[0];
        status.textContent = first && first.name === 'consent'
          ? 'Tick the box to confirm we may email you.'
          : 'Add a valid email address.';
        status.classList.add('error');
        if (first) first.focus();
        return;
      }
      button.disabled = true;
      button.textContent = 'Joining…';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (response) {
          if (!response.ok) throw new Error('Request failed');
          if (typeof window.plausible === 'function') window.plausible('Signup');
          form.hidden = true;
          if (thanks) {
            thanks.hidden = false;
            thanks.focus();
          }
        })
        .catch(function () {
          status.textContent = 'You weren’t added, because the form couldn’t be sent. Try again, or email anton.carcedo@umu.se.';
          status.classList.add('error');
          button.disabled = false;
          button.textContent = buttonText;
        });
    });
  });
})();
