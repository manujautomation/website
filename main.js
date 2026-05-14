/* ═══════════════════════════════════════════════════════
   MENDOCINO LABS — main.js
   All motion, canvas animations, and interactivity
═══════════════════════════════════════════════════════ */

/* ── Nav scroll behavior ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Intersection Observer — scroll reveals ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .reveal-scale')
  .forEach(el => revealObserver.observe(el));

/* ── Animated counters (hero stats) ── */
document.querySelectorAll('[data-target]').forEach(el => {
  const target = +el.dataset.target;
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const dur = 2200;
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(target * ease) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(start);
});

/* ══════════════════════════════════════════════════════
   HERO CANVAS — Glowing particle grid (Palantir/NVIDIA style)
══════════════════════════════════════════════════════ */
(function heroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }, { passive: true });

  // Particles
  const N = 90;
  const pts = Array.from({ length: N }, () => ({
    x: Math.random() * 1600,
    y: Math.random() * 800,
    vx: (Math.random() - .5) * .35,
    vy: (Math.random() - .5) * .25,
    r:  Math.random() * 1.8 + .5,
    a:  Math.random() * .55 + .1,
  }));

  // Grid lines
  const GRID_SZ = 80;

  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(0,87,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += GRID_SZ) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += GRID_SZ) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();

    // Connections
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,87,255,${.1 * (1 - d / 130)})`;
          ctx.lineWidth = .8;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }

    // Mouse repel + draw points
    pts.forEach(p => {
      // Mouse interaction
      const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
      const md = Math.hypot(mdx, mdy);
      if (md < 120) {
        p.vx += (mdx / md) * .08;
        p.vy += (mdy / md) * .08;
      }
      // Speed cap
      const spd = Math.hypot(p.vx, p.vy);
      if (spd > 1.2) { p.vx *= .96; p.vy *= .96; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${p.a})`;
      ctx.fill();

      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════════════════════
   HERO SVG — Flight path animation
══════════════════════════════════════════════════════ */
(function heroFlight() {
  const trail = document.getElementById('trail');
  const dot   = document.getElementById('plane-dot');
  const ring  = document.getElementById('plane-ring');
  const beams = document.getElementById('sig-beams');
  if (!trail) return;

  const len = trail.getTotalLength();
  trail.style.strokeDasharray  = len;
  trail.style.strokeDashoffset = len;

  let t = 0;
  (function go() {
    t = (t + .0011) % 1;
    const pt = trail.getPointAtLength(len * t);
    dot.setAttribute('cx', pt.x);
    dot.setAttribute('cy', pt.y);
    ring.setAttribute('cx', pt.x);
    ring.setAttribute('cy', pt.y);
    trail.style.strokeDashoffset = len * (1 - t);
    requestAnimationFrame(go);
  })();

  // Pulse ring
  setInterval(() => {
    let s = 0;
    (function ex() {
      s += .55;
      ring.setAttribute('r', 9 + s);
      ring.setAttribute('opacity', Math.max(0, .7 - s * .032));
      if (s < 22) requestAnimationFrame(ex);
    })();
  }, 2100);

  setTimeout(() => { beams.style.opacity = '1'; }, 1600);
})();

/* ══════════════════════════════════════════════════════
   5G CORE CANVAS — Animated network function graph
══════════════════════════════════════════════════════ */
(function coreCanvas() {
  const canvas = document.getElementById('core-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // 5G NF nodes
  const nodes = [
    { label: 'AMF', x: .5,  y: .2,  color: '#30A46C' },
    { label: 'SMF', x: .25, y: .45, color: '#00d4ff' },
    { label: 'UPF', x: .75, y: .45, color: '#00d4ff' },
    { label: 'PCF', x: .15, y: .72, color: '#7c3aed' },
    { label: 'UDM', x: .5,  y: .78, color: '#7c3aed' },
    { label: 'NRF', x: .85, y: .72, color: '#f97316' },
    { label: 'gNB', x: .15, y: .25, color: '#00e5cc' },
    { label: 'UE',  x: .85, y: .25, color: '#00e5cc' },
  ];
  const edges = [
    [0,1],[0,2],[1,3],[1,4],[2,5],[3,4],[4,5],[6,0],[7,0],[6,1],[7,2]
  ];

  // Animated packets along edges
  const packets = edges.map(e => ({
    edge: e, t: Math.random(), speed: .004 + Math.random() * .004
  }));

  let tick = 0;
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    tick++;

    // Edges
    edges.forEach(([a, b]) => {
      const ax = nodes[a].x * W, ay = nodes[a].y * H;
      const bx = nodes[b].x * W, by = nodes[b].y * H;
      ctx.beginPath();
      ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
      ctx.strokeStyle = 'rgba(26,52,96,0.9)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Animated packets
    packets.forEach(pk => {
      pk.t = (pk.t + pk.speed) % 1;
      const [a, b] = pk.edge;
      const ax = nodes[a].x * W, ay = nodes[a].y * H;
      const bx = nodes[b].x * W, by = nodes[b].y * H;
      const px = ax + (bx - ax) * pk.t;
      const py = ay + (by - ay) * pk.t;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = nodes[pk.edge[0]].color;
      ctx.shadowColor = nodes[pk.edge[0]].color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Nodes
    nodes.forEach((n, i) => {
      const x = n.x * W, y = n.y * H;
      const pulse = .5 + .5 * Math.sin(tick * .04 + i);
      const r = 22 + 3 * pulse;

      // Glow ring
      ctx.beginPath();
      ctx.arc(x, y, r + 6, 0, Math.PI * 2);
      ctx.fillStyle = n.color + '18';
      ctx.fill();

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#0a1628';
      ctx.strokeStyle = n.color;
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = n.color;
      ctx.font = `bold 11px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, x, y);
    });

    requestAnimationFrame(draw);
  })();
})();

/* ══════════════════════════════════════════════════════
   PRIVATE 5G CANVAS — Coverage hexagon map
══════════════════════════════════════════════════════ */
(function private5gCanvas() {
  const canvas = document.getElementById('private5g-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function hexPoints(cx, cy, r) {
    return Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
  }

  // Device dots within coverage
  const devices = Array.from({ length: 18 }, () => ({
    x: .1 + Math.random() * .8, y: .15 + Math.random() * .7,
    phase: Math.random() * Math.PI * 2, active: Math.random() > .25,
  }));

  // Tower positions
  const towers = [
    { x: .25, y: .35 }, { x: .5, y: .25 }, { x: .75, y: .35 },
    { x: .25, y: .65 }, { x: .5, y: .72 }, { x: .75, y: .65 },
  ];

  let tick = 0;
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    tick++;

    const hexR = Math.min(W, H) * .18;

    // Coverage hexagons per tower
    towers.forEach((t, i) => {
      const cx = t.x * W, cy = t.y * H;
      const pts = hexPoints(cx, cy, hexR);
      const pulse = .5 + .5 * Math.sin(tick * .025 + i);

      ctx.beginPath();
      pts.forEach(([x, y], j) => j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.closePath();
      ctx.fillStyle   = `rgba(124,58,237,${.04 + .02 * pulse})`;
      ctx.strokeStyle = `rgba(124,58,237,${.25 + .1 * pulse})`;
      ctx.lineWidth   = 1.2;
      ctx.fill();
      ctx.stroke();

      // Tower dot
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#a78bfa';
      ctx.shadowColor = '#7c3aed';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Device dots
    devices.forEach(d => {
      const x = d.x * W, y = d.y * H;
      const blink = d.active ? (.7 + .3 * Math.sin(tick * .06 + d.phase)) : .25;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = d.active
        ? `rgba(0,229,204,${blink})`
        : 'rgba(90,122,158,0.3)';
      ctx.fill();

      // Data line to nearest tower
      if (d.active) {
        let nearest = towers[0], nd = Infinity;
        towers.forEach(t => {
          const dd = Math.hypot(t.x * W - x, t.y * H - y);
          if (dd < nd) { nd = dd; nearest = t; }
        });
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nearest.x * W, nearest.y * H);
        ctx.strokeStyle = `rgba(0,229,204,${.12 * blink})`;
        ctx.lineWidth = .8;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    requestAnimationFrame(draw);
  })();
})();

/* ══════════════════════════════════════════════════════
   AI CANVAS — Neural network inference graph
══════════════════════════════════════════════════════ */
(function aiCanvas() {
  const canvas = document.getElementById('ai-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Layer structure: input → hidden1 → hidden2 → output
  const layers = [
    { nodes: 4, x: .12 },
    { nodes: 6, x: .37 },
    { nodes: 6, x: .63 },
    { nodes: 3, x: .88 },
  ];
  const colors = ['#00d4ff', '#7c3aed', '#7c3aed', '#00ff9d'];

  function nodeY(layerNodes, idx, H) {
    const spacing = H / (layerNodes + 1);
    return spacing * (idx + 1);
  }

  // Animated activations
  const activations = [];
  layers.forEach((l, li) => {
    if (li < layers.length - 1) {
      for (let i = 0; i < l.nodes; i++) {
        for (let j = 0; j < layers[li + 1].nodes; j++) {
          activations.push({ li, i, j, t: Math.random(), speed: .008 + Math.random() * .006 });
        }
      }
    }
  });

  let tick = 0;
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    tick++;

    // Connections
    layers.forEach((l, li) => {
      if (li >= layers.length - 1) return;
      for (let i = 0; i < l.nodes; i++) {
        for (let j = 0; j < layers[li + 1].nodes; j++) {
          const x1 = l.x * W, y1 = nodeY(l.nodes, i, H);
          const x2 = layers[li + 1].x * W, y2 = nodeY(layers[li + 1].nodes, j, H);
          ctx.beginPath();
          ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = 'rgba(26,52,96,0.7)';
          ctx.lineWidth = .8;
          ctx.stroke();
        }
      }
    });

    // Animated activation signals
    activations.forEach(act => {
      act.t = (act.t + act.speed) % 1;
      const l1 = layers[act.li], l2 = layers[act.li + 1];
      const x1 = l1.x * W, y1 = nodeY(l1.nodes, act.i, H);
      const x2 = l2.x * W, y2 = nodeY(l2.nodes, act.j, H);
      const px = x1 + (x2 - x1) * act.t;
      const py = y1 + (y2 - y1) * act.t;
      const alpha = Math.sin(act.t * Math.PI);
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = colors[act.li];
      ctx.globalAlpha = alpha * .8;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Nodes
    layers.forEach((l, li) => {
      for (let i = 0; i < l.nodes; i++) {
        const x = l.x * W, y = nodeY(l.nodes, i, H);
        const pulse = .5 + .5 * Math.sin(tick * .05 + li * 1.2 + i * .8);
        const r = 8 + 2 * pulse;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#0a1628';
        ctx.strokeStyle = colors[li];
        ctx.lineWidth = 1.5;
        ctx.shadowColor = colors[li];
        ctx.shadowBlur = 8 * pulse;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    requestAnimationFrame(draw);
  })();
})();

/* ══════════════════════════════════════════════════════
   INDUSTRIES — auto-scroll (CSS handles animation,
   JS pauses on hover for accessibility)
══════════════════════════════════════════════════════ */
(function industries() {
  const track = document.querySelector('.ind-track');
  if (!track) return;
  track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
})();

/* ══════════════════════════════════════════════════════
   STATS MARQUEE — CSS handles animation,
   JS pauses on hover
══════════════════════════════════════════════════════ */
(function statsMarquee() {
  const track = document.querySelector('.stats-track');
  if (!track) return;
  track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
})();

/* ══════════════════════════════════════════════════════
   SMOOTH ANCHOR LINKS
══════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // nav height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ══════════════════════════════════════════════════════
   INDUSTRY TRACK — CSS animation via style injection
══════════════════════════════════════════════════════ */
(function injectIndAnim() {
  const style = document.createElement('style');
  style.textContent = `.ind-track { animation: slide-ind 35s linear infinite; } @keyframes slide-ind { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }`;
  document.head.appendChild(style);
})();
