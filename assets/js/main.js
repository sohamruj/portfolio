(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  function slowScrollTo(targetY, duration = 1000) {
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

  // Tab navigation with slow scrolling + moving indicator
  const links = document.querySelectorAll('.tab-link');
  const indicator = document.querySelector('.tab-indicator');
  function moveIndicator(el){
    if (!indicator || !el) return;
    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement.getBoundingClientRect();
    const width = rect.width;
    const x = rect.left - parentRect.left;
    indicator.style.width = `${width}px`;
    indicator.style.transform = `translateX(${x}px)`;
  }

  links.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetSel = btn.getAttribute('data-target');
      const targetEl = document.querySelector(targetSel);
      if (!targetEl) return;
      e.preventDefault();
      const rect = targetEl.getBoundingClientRect();
      const y = rect.top + window.pageYOffset - 64; // account for sticky header
      slowScrollTo(y, 1000);
      moveIndicator(btn);
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
        moveIndicator(link);
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

  // Tilt effect for cards and hero art
  const tilts = document.querySelectorAll('[data-tilt]');
  tilts.forEach(el => {
    const bounds = { x: 10, y: 10 };
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -bounds.y;
      const ry = (px - 0.5) * bounds.x;
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = 'rotateX(0) rotateY(0)';
    });
  });

  // Magnetic buttons
  const magnets = document.querySelectorAll('.magnetic');
  magnets.forEach(btn => {
    const strength = 18; // pixels
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = (e.clientX - cx)/r.width, dy = (e.clientY - cy)/r.height;
      btn.style.transform = `translate(${dx*strength}px, ${dy*strength}px)`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = 'translate(0,0)';
    });
  });

  // Canvas cursor trail (low-cost particles)
  const canvas = document.getElementById('cursorTrail');
  if (canvas && !prefersReduced){
    const ctx = canvas.getContext('2d');
    const particles = [];
    let w, h; const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    function resize(){ w = canvas.width = canvas.clientWidth * DPR; h = canvas.height = canvas.clientHeight * DPR; }
    resize(); window.addEventListener('resize', resize);
    function spawn(x,y){ particles.push({ x:x*DPR, y:y*DPR, r: 3*DPR, a: 0.4, vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.6 }); }
    window.addEventListener('pointermove', (e)=> spawn(e.clientX, e.clientY));
    function tick(){
      ctx.clearRect(0,0,w,h);
      for (let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.a*=0.96; p.r*=0.98; if(p.a<0.05) particles.splice(i,1); }
      for (const p of particles){ ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fillStyle = `rgba(20,184,166,${p.a})`; ctx.fill(); }
      requestAnimationFrame(tick);
    }
    tick();
  }

  // Section progress indicator
  const prog = document.querySelector('.section-progress span');
  function updateProgress(){
    const total = document.body.scrollHeight - window.innerHeight;
    const ratio = total > 0 ? window.scrollY / total : 0;
    prog && (prog.style.transform = `scaleY(${Math.max(0.08, ratio)})`);
  }
  window.addEventListener('scroll', updateProgress); updateProgress();

  // Command palette (Ctrl/Cmd+K)
  const cmd = document.getElementById('cmdPalette');
  const cmdInput = document.getElementById('cmdInput');
  const cmdList = document.getElementById('cmdList');
  const cmdBtn = document.querySelector('.cmd-btn');
  const commands = [];
  document.querySelectorAll('[data-target]').forEach(el => {
    const sel = el.getAttribute('data-target');
    const target = document.querySelector(sel);
    if (target){ commands.push({ label: target.id, action: ()=> target.scrollIntoView({ behavior:'smooth', block:'start' }) }); }
  });
  // add quick commands
  commands.push({ label: 'Toggle theme', action: ()=> themeToggle.click() });

  function openCmd(){ cmd.setAttribute('aria-hidden','false'); cmdInput.value=''; renderCmd(''); cmdInput.focus(); }
  function closeCmd(){ cmd.setAttribute('aria-hidden','true'); }
  function renderCmd(q){
    const f = (q||'').toLowerCase();
    const results = commands.filter(c => c.label.toLowerCase().includes(f)).slice(0,8);
    cmdList.innerHTML = results.map((c,i)=>`<li data-i="${i}">${c.label}</li>`).join('');
  }
  cmdBtn && cmdBtn.addEventListener('click', openCmd);
  window.addEventListener('keydown', (e)=>{
    if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openCmd(); }
    if (e.key==='Escape') closeCmd();
  });
  cmdInput && cmdInput.addEventListener('input', ()=> renderCmd(cmdInput.value));
  cmdList && cmdList.addEventListener('click', (e)=>{
    const li = e.target.closest('li'); if(!li) return;
    const i = +li.getAttribute('data-i'); const f = (cmdInput.value||'').toLowerCase();
    const results = commands.filter(c => c.label.toLowerCase().includes(f)).slice(0,8);
    results[i]?.action(); closeCmd();
  });
})();
