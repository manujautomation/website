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

/* ══════════════════════════════════════════════════════
   CINEMATIC ECOSYSTEM — Layered canvas engine
   Layers: bg stars → city skyline → perspective grid
           → network paths+nodes → aircraft+particles
══════════════════════════════════════════════════════ */
(function cinematicScene() {

  const layers = {
    bg:      document.getElementById('cine-bg'),
    city:    document.getElementById('cine-city'),
    grid:    document.getElementById('cine-grid'),
    network: document.getElementById('cine-network'),
    top:     document.getElementById('cine-top'),
  };
  if (!layers.bg) return;

  const ctxs = {};
  Object.keys(layers).forEach(k => { ctxs[k] = layers[k].getContext('2d'); });

  let W, H;
  function resize() {
    Object.values(layers).forEach(c => {
      c.width  = c.offsetWidth;
      c.height = c.offsetHeight;
    });
    W = layers.bg.width;
    H = layers.bg.height;
  }
  resize();
  window.addEventListener('resize', () => { resize(); initScene(); }, { passive: true });

  /* ── Scene state ── */
  let stars = [], cityBuildings = [], towers = [], networkNodes = [],
      dataPackets = [], aircraft = [], floatLabels = [];

  function initScene() {
    /* STARS */
    stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * W, y: Math.random() * H * 0.65,
      r: Math.random() * 1.2 + .2,
      a: Math.random() * .7 + .1,
      twinkle: Math.random() * Math.PI * 2,
    }));

    /* CITY BUILDINGS — procedural skyline across bottom half */
    cityBuildings = [];
    const buildingCount = Math.floor(W / 22);
    for (let i = 0; i < buildingCount; i++) {
      const bw = 14 + Math.random() * 28;
      const bh = 40 + Math.random() * (H * 0.35);
      const bx = (W / buildingCount) * i + Math.random() * 8;
      const by = H * 0.72 - bh;
      // Windows
      const winCols = Math.floor(bw / 8);
      const winRows = Math.floor(bh / 10);
      const windows = [];
      for (let wc = 0; wc < winCols; wc++) {
        for (let wr = 0; wr < winRows; wr++) {
          windows.push({
            lit: Math.random() > 0.35,
            flicker: Math.random() > 0.9,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
      cityBuildings.push({ x: bx, y: by, w: bw, h: bh, winCols, winRows, windows });
    }

    /* 5G TOWERS */
    towers = [
      { x: W * .08, y: H * .68, label: '5G NR',    color: '#00d4ff', beamAngle: -0.4 },
      { x: W * .22, y: H * .72, label: 'O-RAN',    color: '#30A46C', beamAngle: -0.25 },
      { x: W * .50, y: H * .70, label: 'CORE',     color: '#7c3aed', beamAngle: 0 },
      { x: W * .78, y: H * .72, label: 'Private5G',color: '#00e5cc', beamAngle: 0.25 },
      { x: W * .92, y: H * .68, label: 'Edge',     color: '#f97316', beamAngle: 0.4 },
    ];

    /* NETWORK NODES — floating holographic */
    networkNodes = [
      { x: W*.15, y: H*.22, label: 'Open5GS Core',   color: '#30A46C', r: 16, pulse: 0 },
      { x: W*.35, y: H*.15, label: 'AMF / SMF / UPF', color: '#00d4ff', r: 14, pulse: 1 },
      { x: W*.55, y: H*.12, label: 'AI Engine',       color: '#7c3aed', r: 18, pulse: 2 },
      { x: W*.75, y: H*.18, label: 'Edge Compute',    color: '#00e5cc', r: 14, pulse: 3 },
      { x: W*.88, y: H*.30, label: 'IoT Fabric',      color: '#f97316', r: 13, pulse: 4 },
      { x: W*.10, y: H*.40, label: 'Data Center',     color: '#60a5fa', r: 15, pulse: 5 },
      { x: W*.65, y: H*.38, label: 'GPU Cluster',     color: '#76b900', r: 15, pulse: 6 },
      { x: W*.42, y: H*.44, label: 'Cloud Fabric',    color: '#a78bfa', r: 13, pulse: 7 },
    ];

    /* DATA PACKETS along network edges */
    const edges = [
      [0,1],[1,2],[2,3],[3,4],[4,7],[0,5],[5,1],[2,7],[7,3],[6,2],[6,3],[5,7]
    ];
    dataPackets = [];
    edges.forEach(([a, b]) => {
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        dataPackets.push({
          a, b, t: Math.random(),
          speed: .003 + Math.random() * .005,
          size: 2 + Math.random() * 2,
          color: networkNodes[a].color,
        });
      }
    });

    /* AIRCRAFT */
    aircraft = [
      { t: 0.15, altitude: H * .18, speed: .0008, trail: [], label: 'ATG Link' },
      { t: 0.55, altitude: H * .10, speed: .0006, trail: [], label: 'N199XP'   },
    ];

    /* FLOATING LABELS */
    floatLabels = [
      { x: W*.50, y: H*.68, text: '⬡ PACKET CORE', color: '#7c3aed', phase: 0 },
      { x: W*.22, y: H*.60, text: '◈ O-RAN RAN',   color: '#30A46C', phase: 1 },
      { x: W*.78, y: H*.60, text: '◈ MEC NODE',    color: '#00e5cc', phase: 2 },
    ];
  }

  initScene();

  /* ── Utility: curved bezier path between two points ── */
  function bezierMidpoint(ax, ay, bx, by) {
    const mx = (ax + bx) / 2;
    const my = Math.min(ay, by) - Math.abs(bx - ax) * 0.25;
    return [mx, my];
  }

  /* ── Utility: point along bezier at t ── */
  function bezierAt(ax, ay, cpx, cpy, bx, by, t) {
    const mt = 1 - t;
    return [
      mt*mt*ax + 2*mt*t*cpx + t*t*bx,
      mt*mt*ay + 2*mt*t*cpy + t*t*by,
    ];
  }

  /* ── Aircraft X position (flies left to right) ── */
  function aircraftX(t) {
    return -W * 0.05 + t * W * 1.1;
  }

  let tick = 0;

  /* ════════════════════════════════
     LAYER 1 — Deep space background
  ════════════════════════════════ */
  function drawBg() {
    const ctx = ctxs.bg;
    ctx.clearRect(0, 0, W, H);

    // Deep space gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,   '#010610');
    bg.addColorStop(0.5, '#02091a');
    bg.addColorStop(1,   '#030d22');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Nebula-style radial glows
    [
      { x: W*.2,  y: H*.3, r: W*.3, c: 'rgba(0,87,255,0.045)' },
      { x: W*.75, y: H*.2, r: W*.25,'c': 'rgba(124,58,237,0.04)' },
      { x: W*.5,  y: H*.5, r: W*.4, c: 'rgba(0,212,255,0.025)' },
    ].forEach(g => {
      const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
      grad.addColorStop(0, g.c);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI*2);
      ctx.fill();
    });

    // Stars with twinkling
    stars.forEach(s => {
      const tw = .5 + .5 * Math.sin(tick * .02 + s.twinkle);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(200,220,255,${s.a * tw})`;
      ctx.fill();
    });

    // Horizon glow
    const hGlow = ctx.createLinearGradient(0, H*.6, 0, H*.75);
    hGlow.addColorStop(0, 'transparent');
    hGlow.addColorStop(.5, 'rgba(0,87,255,0.08)');
    hGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = hGlow;
    ctx.fillRect(0, H*.6, W, H*.15);
  }

  /* ════════════════════════════════
     LAYER 2 — Smart city skyline
  ════════════════════════════════ */
  function drawCity() {
    const ctx = ctxs.city;
    ctx.clearRect(0, 0, W, H);

    // Ground plane
    const grd = ctx.createLinearGradient(0, H*.72, 0, H);
    grd.addColorStop(0, 'rgba(0,87,255,0.06)');
    grd.addColorStop(1, '#010610');
    ctx.fillStyle = grd;
    ctx.fillRect(0, H*.72, W, H);

    // Buildings
    cityBuildings.forEach(b => {
      // Building body
      const bGrad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
      bGrad.addColorStop(0, 'rgba(15,28,55,0.95)');
      bGrad.addColorStop(1, 'rgba(5,12,25,0.98)');
      ctx.fillStyle = bGrad;
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // Building edge highlight
      ctx.strokeStyle = 'rgba(0,87,255,0.15)';
      ctx.lineWidth = .5;
      ctx.strokeRect(b.x, b.y, b.w, b.h);

      // Windows
      const ww = 4, wh = 4, wgx = (b.w - b.winCols*ww) / (b.winCols+1);
      const wgy = (b.h - b.winRows*wh) / (b.winRows+1);
      let wi = 0;
      for (let wc = 0; wc < b.winCols; wc++) {
        for (let wr = 0; wr < b.winRows; wr++) {
          const win = b.windows[wi++];
          if (!win) continue;
          let alpha = win.lit ? .65 : .05;
          if (win.flicker) alpha *= (.7 + .3 * Math.sin(tick * .08 + win.phase));
          const wx2 = b.x + wgx*(wc+1) + ww*wc;
          const wy2 = b.y + wgy*(wr+1) + wh*wr;
          ctx.fillStyle = win.lit
            ? `rgba(${180+Math.random()*40},${170+Math.random()*30},${80+Math.random()*40},${alpha})`
            : `rgba(30,50,90,${alpha})`;
          ctx.fillRect(wx2, wy2, ww, wh);
        }
      }

      // Rooftop antenna light
      if (b.h > H*.15) {
        const blink = Math.sin(tick * .08 + b.x) > .7 ? 1 : 0.1;
        ctx.beginPath();
        ctx.arc(b.x + b.w/2, b.y, 2, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,60,60,${blink})`;
        ctx.fill();
      }
    });

    // Floating labels over city
    floatLabels.forEach(l => {
      const float = Math.sin(tick * .025 + l.phase) * 4;
      ctx.save();
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = l.color;
      ctx.globalAlpha = .75;
      ctx.fillText(l.text, l.x, l.y + float);
      ctx.restore();
    });
  }

  /* ════════════════════════════════
     LAYER 3 — Perspective grid
  ════════════════════════════════ */
  function drawGrid() {
    const ctx = ctxs.grid;
    ctx.clearRect(0, 0, W, H);

    const vp = { x: W * .5, y: H * .72 }; // vanishing point = horizon
    const gridLines = 18;
    const spread = W * .9;

    ctx.save();
    ctx.globalAlpha = .25;

    // Converging lines from vanishing point
    for (let i = 0; i <= gridLines; i++) {
      const x = vp.x - spread/2 + (spread/gridLines) * i;
      const alpha = .05 + .1 * (1 - Math.abs(i - gridLines/2)/(gridLines/2));
      ctx.beginPath();
      ctx.moveTo(vp.x, vp.y);
      ctx.lineTo(x, H);
      ctx.strokeStyle = `rgba(0,87,255,${alpha})`;
      ctx.lineWidth = .8;
      ctx.stroke();
    }

    // Horizontal cross-lines (perspective foreshortened)
    for (let i = 1; i <= 8; i++) {
      const t  = i / 8;
      const y  = vp.y + (H - vp.y) * (t * t); // quadratic spacing
      const xw = (spread / 2) * t;
      ctx.beginPath();
      ctx.moveTo(vp.x - xw, y);
      ctx.lineTo(vp.x + xw, y);
      ctx.strokeStyle = `rgba(0,87,255,${0.04 + .06*t})`;
      ctx.lineWidth = .6;
      ctx.stroke();
    }

    ctx.restore();

    // Horizon glow line
    ctx.beginPath();
    ctx.moveTo(0, vp.y);
    ctx.lineTo(W, vp.y);
    const hGlow = ctx.createLinearGradient(0, 0, W, 0);
    hGlow.addColorStop(0,   'transparent');
    hGlow.addColorStop(.25, 'rgba(0,212,255,0.25)');
    hGlow.addColorStop(.5,  'rgba(0,212,255,0.45)');
    hGlow.addColorStop(.75, 'rgba(0,212,255,0.25)');
    hGlow.addColorStop(1,   'transparent');
    ctx.strokeStyle = hGlow;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  /* ════════════════════════════════
     LAYER 4 — Network nodes + paths
  ════════════════════════════════ */
  function drawNetwork() {
    const ctx = ctxs.network;
    ctx.clearRect(0, 0, W, H);

    // ── Network edge paths (bezier arcs) ──
    const edgePairs = [[0,1],[1,2],[2,3],[3,4],[4,7],[0,5],[5,1],[2,7],[7,3],[6,2],[6,3]];
    edgePairs.forEach(([a, b]) => {
      const na = networkNodes[a], nb = networkNodes[b];
      const [cpx, cpy] = bezierMidpoint(na.x, na.y, nb.x, nb.y);

      // Glowing path
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.quadraticCurveTo(cpx, cpy, nb.x, nb.y);
      ctx.strokeStyle = `rgba(0,87,255,0.18)`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Brighter thin center
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.quadraticCurveTo(cpx, cpy, nb.x, nb.y);
      ctx.strokeStyle = `rgba(0,212,255,0.08)`;
      ctx.lineWidth = .5;
      ctx.stroke();
    });

    // ── Data packets along paths ──
    dataPackets.forEach(pk => {
      pk.t = (pk.t + pk.speed) % 1;
      const na = networkNodes[pk.a], nb = networkNodes[pk.b];
      const [cpx, cpy] = bezierMidpoint(na.x, na.y, nb.x, nb.y);
      const [px, py] = bezierAt(na.x, na.y, cpx, cpy, nb.x, nb.y, pk.t);

      ctx.beginPath();
      ctx.arc(px, py, pk.size, 0, Math.PI*2);
      ctx.fillStyle = pk.color;
      ctx.shadowColor = pk.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // ── 5G Towers ──
    towers.forEach(t => {
      const pulse = .5 + .5 * Math.sin(tick * .04 + t.x * .01);

      // Tower pole
      ctx.beginPath();
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(t.x, t.y - 35);
      ctx.strokeStyle = `rgba(${t.color === '#00d4ff' ? '0,212,255' : '90,122,158'},0.6)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sector beam (fan shape upward)
      const beamW = .4;
      const beamLen = H * .35;
      ctx.save();
      ctx.globalAlpha = .06 + .04 * pulse;
      ctx.beginPath();
      ctx.moveTo(t.x, t.y - 35);
      ctx.lineTo(
        t.x + Math.sin(t.beamAngle - beamW) * beamLen,
        t.y - 35 - Math.cos(t.beamAngle - beamW) * beamLen
      );
      ctx.lineTo(
        t.x + Math.sin(t.beamAngle + beamW) * beamLen,
        t.y - 35 - Math.cos(t.beamAngle + beamW) * beamLen
      );
      ctx.closePath();
      ctx.fillStyle = t.color;
      ctx.fill();
      ctx.restore();

      // Tower apex glowing dot
      ctx.beginPath();
      ctx.arc(t.x, t.y - 35, 4, 0, Math.PI*2);
      ctx.fillStyle = t.color;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 12 * pulse;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Tower label
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillStyle = t.color;
      ctx.textAlign = 'center';
      ctx.globalAlpha = .7;
      ctx.fillText(t.label, t.x, t.y + 10);
      ctx.globalAlpha = 1;
    });

    // ── Network nodes (holographic spheres) ──
    networkNodes.forEach((n, i) => {
      const pulse = .5 + .5 * Math.sin(tick * .035 + n.pulse * .9);
      const r = n.r + 3 * pulse;

      // Outer glow ring
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.5);
      grd.addColorStop(0,   n.color + '28');
      grd.addColorStop(0.5, n.color + '10');
      grd.addColorStop(1,   'transparent');
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 2.5, 0, Math.PI*2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Node circle
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI*2);
      ctx.fillStyle = '#020c1e';
      ctx.strokeStyle = n.color;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 14 * pulse;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Rotating ring
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.rotate(tick * .015 + i);
      ctx.beginPath();
      ctx.arc(0, 0, r + 5, 0, Math.PI * 1.4);
      ctx.strokeStyle = n.color + '60';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Label
      const float = Math.sin(tick * .025 + n.pulse) * 3;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = n.color;
      ctx.globalAlpha = .9;
      ctx.fillText(n.label, n.x, n.y + r + 14 + float);
      ctx.globalAlpha = 1;
    });
  }

  /* ════════════════════════════════
     LAYER 5 — Aircraft + ATG beams + top particles
  ════════════════════════════════ */
  function drawTop() {
    const ctx = ctxs.top;
    ctx.clearRect(0, 0, W, H);

    aircraft.forEach((ac, ai) => {
      ac.t = (ac.t + ac.speed) % 1;
      const x = aircraftX(ac.t);
      const y = ac.altitude + Math.sin(ac.t * Math.PI * 6) * 5; // gentle turbulence

      // Trail
      ac.trail.push({ x, y, a: 1 });
      if (ac.trail.length > 60) ac.trail.shift();
      ac.trail.forEach((tp, ti) => {
        const a = (ti / ac.trail.length) * .5;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, 1.2, 0, Math.PI*2);
        ctx.fillStyle = `rgba(0,255,157,${a})`;
        ctx.fill();
      });

      // ATG beam to nearest tower
      let nearestTower = towers[0], minD = Infinity;
      towers.forEach(t => {
        const d = Math.abs(t.x - x);
        if (d < minD) { minD = d; nearestTower = t; }
      });
      const beamAlpha = Math.max(0, .7 - minD / (W * .25));
      if (beamAlpha > .05) {
        const beamPulse = .5 + .5 * Math.sin(tick * .1);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nearestTower.x, nearestTower.y - 35);
        ctx.strokeStyle = `rgba(0,212,255,${beamAlpha * beamPulse})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Data packet on beam
        const bt = (tick * .03 + ai * .5) % 1;
        const bpx = x + (nearestTower.x - x) * bt;
        const bpy = y + (nearestTower.y - 35 - y) * bt;
        ctx.beginPath();
        ctx.arc(bpx, bpy, 3, 0, Math.PI*2);
        ctx.fillStyle = '#00d4ff';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Aircraft body — glowing dot with plane silhouette
      ctx.save();
      ctx.translate(x, y);
      // Glow
      const planeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
      planeGrad.addColorStop(0,  'rgba(0,255,157,0.5)');
      planeGrad.addColorStop(1,  'transparent');
      ctx.fillStyle = planeGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI*2);
      ctx.fill();

      // Plane shape (simple SVG-style path)
      ctx.fillStyle = '#00ff9d';
      ctx.shadowColor = '#00ff9d';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-8, -4);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-8, 4);
      ctx.closePath();
      ctx.fill();
      // Wings
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-3, -10);
      ctx.lineTo(-7, -9);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-7, 9);
      ctx.lineTo(-3, 10);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Label
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(0,255,157,0.8)';
      ctx.textAlign = 'center';
      ctx.fillText(ac.label, x, y - 20);
    });

    // Atmospheric lens flare at horizon center
    const flareX = W * .5, flareY = H * .72;
    const flareA = .3 + .15 * Math.sin(tick * .018);
    const flareGrd = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, W * .3);
    flareGrd.addColorStop(0,   `rgba(0,212,255,${flareA * .4})`);
    flareGrd.addColorStop(0.3, `rgba(0,87,255,${flareA * .15})`);
    flareGrd.addColorStop(1,   'transparent');
    ctx.fillStyle = flareGrd;
    ctx.beginPath();
    ctx.ellipse(flareX, flareY, W * .3, H * .12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── HUD counter animations ── */
  function animHUD() {
    const t = tick;
    const aircraft = 12 + Math.floor(Math.sin(t * .02) * 4 + 4);
    const handovers = 3 + Math.floor((Math.sin(t * .03) + 1) * 3);
    const gpu = 4096 + Math.floor(Math.sin(t * .015) * 512);
    const inf = 12000 + Math.floor(Math.sin(t * .025) * 3000);
    const iot = 48000 + Math.floor(Math.sin(t * .012) * 8000);
    const nodes = 247 + Math.floor(Math.sin(t * .018) * 22);

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v.toLocaleString(); };
    set('hud-aircraft',  aircraft);
    set('hud-handovers', handovers);
    set('hud-gpu',       gpu);
    set('hud-inf',       inf);
    set('hud-iot',       iot);
    set('hud-nodes',     nodes);
  }

  /* ── Main render loop ── */
  function render() {
    tick++;
    drawBg();
    drawCity();
    drawGrid();
    drawNetwork();
    drawTop();
    if (tick % 3 === 0) animHUD(); // throttle DOM updates
    requestAnimationFrame(render);
  }

  render();

})(); // end cinematicScene

/* ══════════════════════════════════════════════════════
   MOBILE NAV — hamburger toggle
══════════════════════════════════════════════════════ */
(function() {
  const btn    = document.getElementById('nav-hamburger');
  const drawer = document.getElementById('nav-drawer');
  if (!btn || !drawer) return;

  function openDrawer() {
    btn.classList.add('open');
    drawer.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    btn.classList.remove('open');
    drawer.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', function() {
    if (drawer.classList.contains('open')) closeDrawer();
    else openDrawer();
  });

  // Close when a drawer link is clicked
  drawer.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', closeDrawer);
  });

  // Close on ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDrawer();
  });
})();

/* ── Contact Modal ── */
function openContactModal() {
  var overlay = document.getElementById('contact-modal');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(function() {
    var first = overlay.querySelector('input');
    if (first) first.focus();
  }, 50);
}

function closeContactModal() {
  var overlay = document.getElementById('contact-modal');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function submitContactForm(e) {
  e.preventDefault();
  var name    = document.getElementById('cm-name').value.trim();
  var email   = document.getElementById('cm-email').value.trim();
  var checked = document.querySelector('input[name="cm-subject"]:checked');
  var subject = checked ? checked.value : 'General Inquiry';
  var message = document.getElementById('cm-message').value.trim();
  if (!name || !email || !message) return;
  var to      = 'contact@mendocinolabs.com';
  var subLine = encodeURIComponent('[Website] ' + subject);
  var body    = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);
  window.location.href = 'mailto:' + to + '?subject=' + subLine + '&body=' + body;
  closeContactModal();
}

// Close on backdrop click
document.getElementById('contact-modal').addEventListener('click', function(e) {
  if (e.target === this) closeContactModal();
});

// Close on ESC (modal)
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeContactModal();
});
