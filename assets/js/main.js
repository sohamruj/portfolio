(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 680;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  let VISUALS_ENABLED = true;
  function setPerformanceMode(mode){ const low = mode === 'low'; document.body.setAttribute('data-performance', low ? 'low' : 'high'); VISUALS_ENABLED = !low; }
  if (isMobile || prefersReduced) setPerformanceMode('low'); else setPerformanceMode('high');

  // Command palette minimal
  const cmd = document.getElementById('cmdPalette'), cmdInput = document.getElementById('cmdInput'), cmdList = document.getElementById('cmdList'), cmdBtn = document.querySelector('.cmd-btn'); const commands = [];
  function openCmd(){ if(!cmd) return; cmd.setAttribute('aria-hidden','false'); cmdInput && (cmdInput.value=''); renderCmd(''); cmdInput && cmdInput.focus(); }
  function closeCmd(){ cmd && cmd.setAttribute('aria-hidden','true'); }
  function renderCmd(q){ if(!cmdList) return; const f = (q||'').toLowerCase(); const results = commands.filter(c => c.label.toLowerCase().includes(f)).slice(0,8); cmdList.innerHTML = results.map((c,i)=>`<li data-i="${i}">${c.label}</li>`).join(''); }
  cmdBtn && cmdBtn.addEventListener('click', openCmd);
  window.addEventListener('keydown', (e)=>{ if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openCmd(); } if (e.key==='Escape') closeCmd(); });
  cmdInput && cmdInput.addEventListener('input', ()=> renderCmd(cmdInput.value));
  cmdList && cmdList.addEventListener('click', (e)=>{ const li = e.target.closest('li'); if(!li) return; const i = +li.getAttribute('data-i'); const f = (cmdInput.value||'').toLowerCase(); const results = commands.filter(c => c.label.toLowerCase().includes(f)).slice(0,8); results[i]?.action(); closeCmd(); });

  // Section tilt 3D
  if (finePointer && !isMobile){
    document.querySelectorAll('.section').forEach(sec => {
      sec.classList.add('tilt3d'); const maxX = 4, maxY = 4;
      sec.addEventListener('pointermove', (e) => { const r = sec.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height; const rx = (py - 0.5) * -maxY, ry = (px - 0.5) * maxX; sec.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; });
      sec.addEventListener('pointerleave', () => { sec.style.transform = 'rotateX(0) rotateY(0)'; });
    });
  }

  // Starfield
  (function(){ const canvas = document.getElementById('starfieldCanvas'); if (!canvas || prefersReduced) return; const ctx = canvas.getContext('2d'); let w=0, h=0; const DPR = Math.max(1, Math.min(2, window.devicePixelRatio||1)); let stars=[]; function resize(){ w = canvas.width = canvas.clientWidth * DPR; h = canvas.height = canvas.clientHeight * DPR; const count = Math.round((w*h)/(2000*DPR*DPR)); stars = new Array(count).fill(0).map(()=>({ x: (Math.random()-0.5)*w, y: (Math.random()-0.5)*h, z: Math.random()*w, v: 0.6 + Math.random()*0.8 })); } resize(); window.addEventListener('resize', resize); function tick(){ if (!VISUALS_ENABLED){ requestAnimationFrame(tick); return; } ctx.clearRect(0,0,w,h); const cx = w/2, cy = h/2; for (let s of stars){ s.z -= s.v; if (s.z < 1) { s.x = (Math.random()-0.5)*w; s.y = (Math.random()-0.5)*h; s.z = w; } const k = 300 / s.z; const x = cx + s.x * k; const y = cy + s.y * k; const r = Math.max(0.6, 1.8 * (1 - s.z/w)) * DPR; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill(); } requestAnimationFrame(tick); } tick(); })();

  // Neurons with glowing trails
  (function(){ const canvas = document.getElementById('neuronsCanvas'); if (!canvas) return; const DPR = Math.max(1, Math.min(2, window.devicePixelRatio||1)); const ctx = canvas.getContext('2d'); let w=0, h=0; let nodes=[], edges=[], pulses=[]; let running=true; function resize(){ w = canvas.width = canvas.clientWidth * DPR; h = canvas.height = canvas.clientHeight * DPR; } resize(); window.addEventListener('resize', resize); function rand(a,b){ return a + Math.random()*(b-a); } function createGraph(){ nodes = []; edges = []; pulses=[]; const count = Math.round((w*h)/(1200*DPR*DPR)); for (let i=0;i<count;i++) nodes.push({ x: rand(0,w), y: rand(0,h), r: rand(1.2,2.2) }); for (let i=0;i<nodes.length;i++){ const a = nodes[i]; let nearest = []; for (let j=0;j<nodes.length;j++) if (j!==i){ const b=nodes[j]; const d=(a.x-b.x)**2+(a.y-b.y)**2; nearest.push({j,d}); } nearest.sort((p,q)=>p.d-q.d); nearest.slice(0,3).forEach(n=> edges.push({a:i,b:n.j})); } for (let k=0;k<Math.min(20, nodes.length); k++) pulses.push({ e: Math.floor(rand(0,edges.length)), t: rand(0,1), v: rand(0.002,0.006), history: [] }); } createGraph(); function burst(n=8, speed=0.004){ for (let i=0;i<n;i++){ pulses.push({ e: Math.floor(rand(0,edges.length)), t: 0, v: speed + rand(0,0.003), history: [] }); } } window.NEURONS_API = { burst };
    function tick(){ if(!running || !VISUALS_ENABLED) { requestAnimationFrame(tick); return; } ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0,0,w,h); ctx.lineWidth = 0.6*DPR; ctx.strokeStyle = 'rgba(160,180,255,0.08)'; ctx.beginPath(); for (const e of edges){ const a = nodes[e.a], b = nodes[e.b]; ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); } ctx.stroke(); for (const n of nodes){ ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2); ctx.fillStyle = 'rgba(94,234,212,0.22)'; ctx.fill(); } for (const p of pulses){ const e = edges[p.e]; if(!e) continue; const a=nodes[e.a], b=nodes[e.b]; const x = a.x + (b.x-a.x)*p.t; const y = a.y + (b.y-a.y)*p.t; p.t += p.v; if (p.t>=1){ p.t=0; p.e = Math.floor(rand(0,edges.length)); p.history = []; } p.history.push({x,y}); if (p.history.length > 16) p.history.shift(); for (let i=0;i<p.history.length;i++){ const h = p.history[i]; const alpha = Math.max(0, 0.35 - (p.history.length - i) * 0.02); const radius = (6 - (p.history.length - i) * 0.3) * DPR; if (alpha <= 0 || radius <= 0) continue; const g = ctx.createRadialGradient(h.x,h.y,0,h.x,h.y,radius); g.addColorStop(0, `rgba(34,211,238,${alpha})`); g.addColorStop(1, 'rgba(34,211,238,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(h.x, h.y, radius*0.6, 0, Math.PI*2); ctx.fill(); } const g = ctx.createRadialGradient(x,y,0,x,y,10*DPR); g.addColorStop(0,'rgba(34,211,238,0.95)'); g.addColorStop(1,'rgba(34,211,238,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,7*DPR,0,Math.PI*2); ctx.fill(); } requestAnimationFrame(tick);} requestAnimationFrame(tick); const observer = new MutationObserver(()=>{ running = document.body.getAttribute('data-performance')!=='low'; }); observer.observe(document.body, { attributes:true, attributeFilter:['data-performance','data-mode'] }); })();
})();
