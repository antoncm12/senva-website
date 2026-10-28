/* Senva website: menu, section highlighting, the waiting-list forms and the question helper. No cookies, no tracking. */
(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  // Old addresses of sections that moved or were renamed
  if (document.querySelector('.hero')) {
    var moved = { '#journey': 'about.html#journey', '#news': '#about', '#latest': '#about', '#team': '#about', '#model': '#different' };
    if (moved[location.hash]) location.replace(moved[location.hash]);
  }

  // Menu button on small screens. While the menu is open, the page behind it is inert,
  // so the keyboard and screen readers stay in the header and the menu.
  if (header && toggle && nav) {
    var label = toggle.querySelector('.nav-toggle-label');
    var setOpen = function (open) {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? 'Close' : 'Menu';
      Array.prototype.forEach.call(document.querySelectorAll('.skip, main, footer, .assist-launcher, .assist-panel'), function (part) {
        if (open) part.setAttribute('inert', '');
        else part.removeAttribute('inert');
      });
    };
    toggle.addEventListener('click', function () {
      setOpen(!header.classList.contains('is-open'));
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });
    var headerJoin = header.querySelector('.header-join');
    if (headerJoin) headerJoin.addEventListener('click', function () { setOpen(false); });
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

/* Question helper. It answers common questions with the written answers in assistant.js (made from the questions on
   the home page), entirely in the visitor's browser: nothing typed here is stored or sent anywhere. When it has no
   answer, it offers to email one of us, from the visitor's own email program. */
(function () {
  var script = document.querySelector('script[src*="site.js"]');
  if (!script || !document.querySelector('main')) return;
  var base = script.src.replace(/site\.js(\?.*)?$/, '');
  var version = (script.src.match(/\?v=\w+$/) || [''])[0];
  var onDisk = location.protocol === 'file:';
  var data = null;
  var loading = false;
  var lastQuestion = '';

  // Words that carry no meaning on their own. 'test' and 'how' turn up in almost every question, so they only count
  // inside phrases such as "how does it work". A word used as a keyword in assistant.js must not be on this list.
  var stop = {};
  ('a an the is are am be do does did i im ive my me mine you your youre we our us can could will would should what whats '
    + 'how to of in on at for and or it its this that with about there any if as by from have has get got so just please '
    + 'tell know want like need much many which where senva health test question hi hello hey why '
    + 'take use make give go see look looking mean really also still actually possible think say some other all one here '
    + 'then than very too not no yes now '
    + 'vad det är jag du ni vi min mitt mina och att en ett som hur kan ska skulle för på av med om till den de har blir '
    + 'finns vill man mig er era ert din ditt dina från andra sig så nu inte ja nej också eller men var vilken vilka varför').split(' ')
    .forEach(function (w) { stop[w] = true; });
  var norm = function (text) {
    return ' ' + text.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9åäöéü\s-]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  };
  var stem = function (w) { return (w.length > 3 && w.slice(-1) === 's' && w.slice(-2) !== 'ss') ? w.slice(0, -1) : w; };
  var words = function (text) {
    return norm(text).trim().split(' ').filter(function (w) { return w && !stop[w]; }).map(stem);
  };
  // A phrase that matches counts 3, a word 2, and a word marked ~ only 1. 'hit' keeps the words of the question that
  // matched, so the helper can tell when an answer only fits part of the question.
  var score = function (item, q, qwords) {
    var total = 0, hit = {};
    item.kw.forEach(function (k) {
      var weak = k.charAt(0) === '~';
      if (weak) k = k.slice(1);
      if (k.indexOf(' ') > -1) {
        if (q.indexOf(norm(k)) > -1) { total += 3; words(k).forEach(function (w) { hit[w] = true; }); }
        return;
      }
      var w = stem(k);
      if (qwords.indexOf(w) > -1) { total += weak ? 1 : 2; hit[w] = true; }
    });
    words(item.q).forEach(function (w) { if (qwords.indexOf(w) > -1) { total += 0.5; hit[w] = true; } });
    return { s: total, hit: hit };
  };
  var find = function (text) {
    var q = norm(text), qwords = words(text);
    var found = data.items.map(function (item, i) { var r = score(item, q, qwords); r.item = item; r.i = i; return r; })
      .filter(function (r) { return r.s >= 2; })
      .sort(function (a, b) { return b.s - a.s || a.i - b.i; });
    // Only one word matched, and the question has words the answer doesn't cover: say it's the closest answer
    if (found.length && found[0].s < 3) {
      found.unsure = qwords.some(function (w) { return !found[0].hit[w]; });
    }
    return found;
  };
  var byId = function (id) {
    for (var i = 0; i < data.items.length; i++) if (data.items[i].id === id) return data.items[i];
    return null;
  };
  var resolve = function (href) {
    if (href.indexOf('mailto:') === 0) return href;
    if (href.charAt(0) === '#') {
      if (document.getElementById(href.slice(1))) return href;
      return base + (onDisk ? 'index.html' : '') + href;
    }
    return base + href;
  };

  // The button and the panel
  var make = function (tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };
  var launcher = make('button', 'assist-launcher');
  launcher.type = 'button';
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'assist-panel');
  launcher.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z"/><path class="dot" d="M8.5 9.6h.01M12 9.6h.01M15.5 9.6h.01"/></svg><span class="assist-launcher-text">Ask a question</span>';
  var panel = make('section', 'assist-panel');
  panel.id = 'assist-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'assist-title');
  panel.hidden = true;
  panel.innerHTML = '<div class="assist-head"><h2 id="assist-title">Questions about Senva Health</h2>'
    + '<button type="button" class="assist-close"><span class="visually-hidden">Close the question helper</span>'
    + '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m5 5 10 10M15 5 5 15"/></svg></button></div>'
    + '<div class="assist-log" role="log" aria-live="polite" tabindex="-1"></div>'
    + '<form class="assist-form"><label class="visually-hidden" for="assist-input">Your question</label>'
    + '<input id="assist-input" type="text" autocomplete="off" maxlength="300" placeholder="Type your question">'
    + '<button type="submit" class="assist-send">Ask</button></form>'
    + '<p class="assist-note">Answers come from our questions page. Nothing you type is stored or sent.</p>';
  document.body.appendChild(launcher);
  document.body.appendChild(panel);
  var log = panel.querySelector('.assist-log');
  var form = panel.querySelector('.assist-form');
  var input = panel.querySelector('#assist-input');

  // Messages
  var add = function (who, build) {
    var msg = make('div', 'assist-msg ' + who);
    build(msg);
    log.appendChild(msg);
    return msg;
  };
  var chips = function (items, extra) {
    var row = make('div', 'assist-chips');
    items.forEach(function (item) {
      if (!item) return;
      var chip = make('button', 'assist-chip', item.q);
      chip.type = 'button';
      chip.addEventListener('click', function () { ask(item.q, item); });
      row.appendChild(chip);
    });
    if (extra) row.appendChild(extra);
    return row;
  };
  var talkChip = function () {
    var chip = make('button', 'assist-chip assist-chip-talk', 'Write to us');
    chip.type = 'button';
    chip.addEventListener('click', function () { ask('Write to us', byId('contact')); });
    return chip;
  };
  var contacts = function (msg) {
    var list = make('div', 'assist-contacts');
    data.contacts.forEach(function (c) {
      var link = make('a', 'assist-contact');
      link.href = 'mailto:' + c.email + '?subject=' + encodeURIComponent('Question about Senva Health')
        + (lastQuestion ? '&body=' + encodeURIComponent(lastQuestion + '\n\n') : '');
      link.appendChild(make('strong', '', 'Email ' + c.name.split(' ')[0]));
      link.appendChild(make('span', '', c.name + ', ' + c.role + ', for ' + c.topics));
      link.appendChild(make('span', 'assist-email', c.email));
      list.appendChild(link);
    });
    msg.appendChild(list);
  };
  var answer = function (item, related, unsure) {
    add('bot', function (msg) {
      if (unsure) msg.appendChild(make('p', 'assist-unsure', 'This is the closest answer I have. If it doesn’t help, write to us.'));
      if (item.id !== 'contact') msg.appendChild(make('p', 'assist-q', item.q));
      msg.appendChild(make('p', '', item.a));
      if (item.links.length) {
        var links = make('p', 'assist-links');
        item.links.forEach(function (l) {
          var a = make('a', '', l.label);
          a.href = resolve(l.href);
          links.appendChild(a);
        });
        msg.appendChild(links);
      }
      if (item.contact) contacts(msg);
      var next = related.filter(function (r) { return r !== item; }).slice(0, 2);
      msg.appendChild(chips(next, item.contact ? null : talkChip()));
    });
  };
  var ask = function (text, item) {
    text = text.replace(/\s+/g, ' ').trim().slice(0, 300);
    if (!text) return;
    var you = add('you', function (msg) { msg.textContent = text; });
    if (!item) lastQuestion = text;
    var bare = norm(text).trim();
    if (!item && /^(hi|hello|hey|hej|hallå|good (morning|afternoon|evening))( there)?$/.test(bare)) {
      add('bot', function (msg) {
        msg.appendChild(make('p', '', 'Hello! What would you like to know about Senva Health?'));
        msg.appendChild(chips(data.start.map(byId), talkChip()));
      });
    } else if (!item && /^(thanks|thank you|thanks a lot|tack|tack så mycket|cheers|great|ok|okay)$/.test(bare)) {
      add('bot', function (msg) { msg.appendChild(make('p', '', 'You’re welcome. Ask me anything else about Senva Health.')); });
    } else {
      var found = item ? [{ item: item }] : find(text);
      if (found.length) {
        answer(found[0].item, found.slice(1, 3).map(function (r) { return r.item; }), found.unsure);
      } else {
        add('bot', function (msg) {
          msg.appendChild(make('p', '', 'I don’t have an answer to that yet. Write to us and one of us will reply by email.'));
          contacts(msg);
        });
      }
    }
    log.scrollTop = you.offsetTop - log.offsetTop - 12;
  };

  // Loading the answers the first time the helper opens
  var start = function () {
    log.innerHTML = '';
    add('bot', function (msg) {
      msg.appendChild(make('p', '', 'Hi! I’m an automated helper. I answer common questions about Senva Health with the answers from our questions page. Pick a question or type your own.'));
      msg.appendChild(chips(data.start.map(byId), talkChip()));
    });
  };
  var load = function () {
    if (data || loading) return;
    if (window.senvaAssistant) { data = window.senvaAssistant; start(); return; }
    loading = true;
    add('bot', function (msg) { msg.appendChild(make('p', '', 'Loading…')); });
    var tag = document.createElement('script');
    tag.src = base + 'assistant.js' + version;
    tag.onload = function () { loading = false; data = window.senvaAssistant; if (data) start(); };
    tag.onerror = function () {
      loading = false;
      log.innerHTML = '';
      add('bot', function (msg) {
        msg.appendChild(make('p', '', 'The answers didn’t load. You can email us instead: anton.carcedo@umu.se or ake.brannstrom@umu.se.'));
      });
    };
    document.head.appendChild(tag);
  };

  // Opening and closing
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var setOpen = function (open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.classList.toggle('assist-open', open);
    if (open) {
      load();
      (coarse ? log : input).focus();
    } else {
      launcher.focus();
    }
  };
  launcher.addEventListener('click', function () { setOpen(panel.hidden); });
  panel.querySelector('.assist-close').addEventListener('click', function () { setOpen(false); });
  panel.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); }
  });
  panel.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (link && link.getAttribute('href').charAt(0) === '#') setOpen(false);
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!data) return;
    ask(input.value);
    input.value = '';
  });
})();
