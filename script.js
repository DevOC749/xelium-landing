(() => {
  const canvas = document.getElementById("particles");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  let w = 0, h = 0, dpr = 1;

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  // Match XELIUM logo spheres (green, blue/cyan, purple)
  const palette = [
    { r: 120, g: 255, b: 160 }, // neon green
    { r: 110, g: 210, b: 255 }, // cyan/blue
    { r: 190, g: 120, b: 255 }  // purple
  ];

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // Particle count scales with screen size
  const COUNT = Math.floor(Math.min(120, Math.max(60, (w * h) / 16000)));
  const particles = [];

  for (let i = 0; i < COUNT; i++) {
    const c = pick(palette);
    particles.push({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.9, 2.4),
      vx: rand(0.10, 0.55),  // forward drift for "comet" feel
      vy: rand(-0.15, 0.25),
      a: rand(0.25, 0.75),
      c
    });
  }

  function drawParticle(p) {
    // soft glow dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.c.r}, ${p.c.g}, ${p.c.b}, ${p.a})`;
    ctx.fill();
  }

  // Very subtle links (optional) - leave on; tell me if you want them removed
  function drawLinks() {
    const maxDist = 105;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist) {
          const t = 1 - dist / maxDist;
          // blend color lightly (use cyan-ish)
          ctx.strokeStyle = `rgba(110, 210, 255, ${0.06 * t})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  // Comet trail: we DO NOT fully clear the canvas each frame.
  // Instead, we paint a very transparent dark layer to fade previous frames.
  function fadeFrame() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.10)"; // lower = longer trails; higher = shorter
    ctx.fillRect(0, 0, w, h);
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(32, now - last);
    last = now;

    fadeFrame();

    for (const p of particles) {
      // Draw a short "comet" stroke behind the particle
      const tail = 10; // tail length in px
      const tx = p.x - p.vx * tail;
      const ty = p.y - p.vy * tail;

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = `rgba(${p.c.r}, ${p.c.g}, ${p.c.b}, ${Math.min(0.35, p.a)})`;
      ctx.lineWidth = Math.max(1, p.r);
      ctx.stroke();

      // Move
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Wrap
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      drawParticle(p);
    }

    drawLinks();
    requestAnimationFrame(tick);
  }

  // Start with a clean frame
  ctx.clearRect(0, 0, w, h);
  requestAnimationFrame(tick);
})();

