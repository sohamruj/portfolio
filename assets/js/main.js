(function(){
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme toggle with localStorage
  const themeToggle = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storedTheme = localStorage.getItem('theme');
  const applyTheme = (t) => {
    if (t === 'light') document.documentElement.setAttribute('data-theme','light');
    else document.documentElement.removeAttribute('data-theme');
  }
  applyTheme(storedTheme || (prefersDark ? 'dark' : 'light'));
  themeToggle && themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
    themeToggle.textContent = next === 'light' ? '🌙' : '☀️';
  });

  // Slow scroll function (custom easing)
  function slowScrollTo(targetY, duration = 900) {
    const startY = window.scrollY || window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();

    function easeInOutCubic(t){ return t<0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2 }

    function step(now){
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startY + distance * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Tab navigation with slow scrolling
  const links = document.querySelectorAll('.tab-link');
  links.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetSel = btn.getAttribute('data-target');
      const targetEl = document.querySelector(targetSel);
      if (!targetEl) return;
      e.preventDefault();
      const rect = targetEl.getBoundingClientRect();
      const y = rect.top + window.pageYOffset - 64; // account for sticky header
      slowScrollTo(y, 1000); // noticeably slow scroll
    });
  });

  // Active tab highlighting using IntersectionObserver
  const sections = document.querySelectorAll('main.section, section.section');
  const map = new Map();
  links.forEach(l => map.set(l.getAttribute('data-target'), l));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = '#' + entry.target.id;
      const link = map.get(id);
      if (!link) return;
      if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
        document.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { threshold: [0.3, 0.6] });
  sections.forEach(s => observer.observe(s));

  // Subtle reveal on scroll
  const revealEls = document.querySelectorAll('.card, .section-title, .chip');
  revealEls.forEach(el => { el.style.opacity = 0; el.style.transform = 'translateY(10px)'; });
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(({target, isIntersecting}) => {
      if (isIntersecting) {
        target.style.transition = 'opacity .6s ease, transform .6s ease';
        target.style.opacity = 1; target.style.transform = 'translateY(0)';
        revealObs.unobserve(target);
      }
    });
  }, { threshold: 0.2 });
  revealEls.forEach(el => revealObs.observe(el));

  // Contact form: EmailJS or serverless
  const statusEl = document.getElementById('formStatus');
  const form = document.getElementById('contactForm');
  function setStatus(msg){ if(statusEl) statusEl.textContent = msg; }

  // If EmailJS config present, inject SDK and wire up
  function setupEmailJS(){
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
    s.onload = () => {
      // eslint-disable-next-line
      emailjs.init(window.APP_CONFIG.EMAILJS_PUBLIC_KEY);
      form.addEventListener('submit', async () => {
        setStatus('Sending…');
        try {
          const formData = new FormData(form);
          const payload = {
            from_name: formData.get('name'),
            reply_to: formData.get('email'),
            message: formData.get('message')
          };
          await emailjs.send(window.APP_CONFIG.EMAILJS_SERVICE_ID, window.APP_CONFIG.EMAILJS_TEMPLATE_ID, payload);
          setStatus('Sent! I will get back to you soon.');
          form.reset();
        } catch (e) {
          console.error(e); setStatus('Failed to send via EmailJS. Falling back…');
          setupServerless();
        }
      });
    };
    document.head.appendChild(s);
  }

  function setupServerless(){
    form.addEventListener('submit', async () => {
      setStatus('Sending…');
      try {
        const body = {
          name: form.name.value,
          email: form.email.value,
          message: form.message.value
        };
        const res = await fetch(window.APP_CONFIG.SERVERLESS_ENDPOINT || '/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('Network response was not ok');
        setStatus('Sent! I will get back to you soon.');
        form.reset();
      } catch(e){ console.error(e); setStatus('Failed to send. Please email me directly.'); }
    }, { once: true });
  }

  if (window.APP_CONFIG && window.APP_CONFIG.EMAILJS_PUBLIC_KEY) setupEmailJS();
  else setupServerless();
})();
