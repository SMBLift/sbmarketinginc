// S.B. Marketing Inc. — shared behavior

// ----- mobile menu (focus-trapped drawer) -----
(function () {
  const btn = document.getElementById('menu-toggle');
  const drawer = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('menu-close');
  if (!btn || !drawer) return;

  const focusables = () =>
    drawer.querySelectorAll('a[href], button:not([disabled])');

  function openMenu() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const f = focusables();
    if (f.length) f[0].focus();
  }
  function closeMenu() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    btn.focus();
  }
  btn.addEventListener('click', () =>
    drawer.classList.contains('open') ? closeMenu() : openMenu()
  );
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return closeMenu();
    if (e.key !== 'Tab') return;
    const f = focusables();
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();

// ----- impact counters (count up once in view; skipped for reduced motion) -----
(function () {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const render = (el, v) => {
    el.textContent =
      (el.dataset.prefix || '') + v.toLocaleString('en-US') + (el.dataset.suffix || '');
  };
  els.forEach((el) => render(el, parseInt(el.dataset.count, 10)));
  if (reduced || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.done) return;
        entry.target.dataset.done = '1';
        const target = parseInt(entry.target.dataset.count, 10);
        const t0 = performance.now();
        const dur = 1200;
        const tick = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          render(entry.target, Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 }
  );
  els.forEach((el) => io.observe(el));
})();

// ----- contact / info form -> Cloudflare Worker (Brevo) -----
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const ts = document.getElementById('form-timestamp');
  if (ts) ts.value = Date.now();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (data._honeypot) return;

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
      const res = await fetch(form.dataset.worker || 'WORKER_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Submission failed');
      form.reset();
      if (ts) ts.value = Date.now();
      const msg = document.getElementById('form-success');
      if (msg) {
        msg.classList.remove('hidden');
        msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (window.history && history.replaceState) {
        history.replaceState(null, '', window.location.pathname);
      }
    } catch (err) {
      const errBox = document.getElementById('form-error');
      if (errBox) errBox.classList.remove('hidden');
      else alert('Something went wrong. Please call us at (412) 885-0404.');
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
})();
