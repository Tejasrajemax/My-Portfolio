/* ============================================================
   Tejas Raj — Portfolio interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCursorGlow();
  initScrollProgress();
  initReveal();
  initCounters();
  initTilt();
  initHeroWave();
  initFeaturedField();
  initContactField();
  wireResumeLinks();
});

/* ---------- Nav shrink + mobile toggle ---------- */
function initNav() {
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav-links');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = links.style.display === 'flex';
      links.style.display = open ? 'none' : 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '100%';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = 'rgba(9,12,20,0.97)';
      links.style.padding = '24px 32px';
      links.style.gap = '18px';
      links.style.borderBottom = '1px solid var(--border)';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { links.style.display = 'none'; }));
  }
}

/* ---------- Cursor glow ---------- */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.matchMedia('(pointer: coarse)').matches) return;
  let x = window.innerWidth / 2, y = window.innerHeight / 2, cx = x, cy = y;
  window.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
  (function loop() {
    cx += (x - cx) * 0.12;
    cy += (y - cy) * 0.12;
    glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();
}

/* ---------- Scroll progress bar ---------- */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  const onScroll = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = scrolled + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const targets = document.querySelectorAll(
    '.about-grid, .work-featured, .work-card, .skill-group, .tl-item, .contact-inner'
  );
  targets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => io.observe(el));
}

/* ---------- Animated counters ---------- */
function initCounters() {
  const nums = document.querySelectorAll('.stat-num');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1200;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });
  nums.forEach(el => io.observe(el));
}

/* ---------- 3D tilt on project cards ---------- */
function initTilt() {
  const cards = document.querySelectorAll('[data-tilt]');
  if (window.matchMedia('(pointer: coarse)').matches) return;
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0)';
    });
  });
}

/* ---------- Resume/social link placeholders ---------- */
function wireResumeLinks() {
  // Résumé download already points to the bundled PDF.
}

/* ============================================================
   THREE.JS — Hero: 3D audio-waveform sphere
   A field of points arranged on a sphere, displaced radially by
   layered sine waves to read as a live audio waveform / spectrum.
   ============================================================ */
function initHeroWave() {
  const canvas = document.getElementById('waveCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  // Base geometry: icosphere point cloud
  const geo = new THREE.IcosahedronGeometry(2.4, 5);
  const posAttr = geo.attributes.position;
  const basePositions = new Float32Array(posAttr.array); // copy of rest positions
  const count = posAttr.count;

  // Color gradient per-vertex: violet (low) -> cyan (high), based on original y
  const colors = new Float32Array(count * 3);
  const cViolet = new THREE.Color(0x8b6bf7);
  const cCyan = new THREE.Color(0x26e3d7);
  let minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < count; i++) {
    const y = basePositions[i * 3 + 1];
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  for (let i = 0; i < count; i++) {
    const y = basePositions[i * 3 + 1];
    const t = (y - minY) / (maxY - minY);
    const c = cViolet.clone().lerp(cCyan, t);
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.028,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // thin wireframe shell for structure
  const wireGeo = new THREE.IcosahedronGeometry(2.4, 2);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x2c3450, wireframe: true, transparent: true, opacity: 0.18 });
  const wireMesh = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wireMesh);

  let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();
    const pos = geo.attributes.position;

    for (let i = 0; i < count; i++) {
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
      const bx = basePositions[ix], by = basePositions[iy], bz = basePositions[iz];
      const len = Math.sqrt(bx * bx + by * by + bz * bz);
      const nx = bx / len, ny = by / len, nz = bz / len;

      // layered sine displacement = "waveform" feel
      const wave =
        Math.sin(ny * 5.0 + t * 1.4) * 0.11 +
        Math.sin(nx * 8.0 - t * 2.1) * 0.06 +
        Math.sin(nz * 6.0 + t * 1.7) * 0.05;

      const scale = 1 + wave;
      pos.array[ix] = nx * len * scale;
      pos.array[iy] = ny * len * scale;
      pos.array[iz] = nz * len * scale;
    }
    pos.needsUpdate = true;

    targetRotX += (mouseY * 0.25 - targetRotX) * 0.03;
    targetRotY += (mouseX * 0.35 - targetRotY) * 0.03;
    points.rotation.x = targetRotX + t * 0.03;
    points.rotation.y = targetRotY + t * 0.05;
    wireMesh.rotation.copy(points.rotation);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
  window.addEventListener('resize', resize);
}

/* ============================================================
   THREE.JS — Work section: transaction-flow particle field
   Points drift between 5 attractor "operation" clusters, visualizing
   the flow of banking operations (deposit, withdraw, balance, etc).
   ============================================================ */
function initFeaturedField() {
  const canvas = document.getElementById('featuredCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const N = 260;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);
  const palette = [0x8b6bf7, 0x26e3d7, 0xf7b955, 0x5f8ff5, 0xe86bd0].map(c => new THREE.Color(c));

  // 5 attractors arranged in a ring
  const attractors = [];
  for (let a = 0; a < 5; a++) {
    const ang = (a / 5) * Math.PI * 2;
    attractors.push(new THREE.Vector3(Math.cos(ang) * 2.1, Math.sin(ang) * 2.1, (Math.random() - 0.5) * 0.6));
  }

  const assign = [];
  for (let i = 0; i < N; i++) {
    const group = i % 5;
    assign.push(group);
    const a = attractors[group];
    positions[i * 3] = a.x + (Math.random() - 0.5) * 0.9;
    positions[i * 3 + 1] = a.y + (Math.random() - 0.5) * 0.9;
    positions[i * 3 + 2] = a.z + (Math.random() - 0.5) * 0.9;
    const c = palette[group];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.85 });
  const cloud = new THREE.Points(geo, mat);
  scene.add(cloud);

  const clock = new THREE.Clock();
  function animate() {
    resize();
    const t = clock.getElapsedTime();
    const pos = geo.attributes.position;
    for (let i = 0; i < N; i++) {
      const group = assign[i];
      const a = attractors[group];
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
      const orbit = 0.15;
      pos.array[ix] = a.x + Math.sin(t * 0.6 + i) * orbit;
      pos.array[iy] = a.y + Math.cos(t * 0.5 + i * 1.3) * orbit;
      pos.array[iz] = a.z + Math.sin(t * 0.4 + i * 0.7) * orbit * 0.6;
    }
    pos.needsUpdate = true;
    cloud.rotation.y = t * 0.08;
    cloud.rotation.x = Math.sin(t * 0.15) * 0.1;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
  window.addEventListener('resize', resize);
}

/* ============================================================
   THREE.JS — Contact section: ambient particle field
   ============================================================ */
function initContactField() {
  const canvas = document.getElementById('contactCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const N = 180;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0x5f8ff5, size: 0.035, transparent: true, opacity: 0.5 });
  const cloud = new THREE.Points(geo, mat);
  scene.add(cloud);

  const clock = new THREE.Clock();
  function animate() {
    resize();
    const t = clock.getElapsedTime();
    cloud.rotation.y = t * 0.02;
    cloud.rotation.x = t * 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
  window.addEventListener('resize', resize);
}
