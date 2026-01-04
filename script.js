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

  // Particles
  const COUNT = Math.floor(Math.min(140, Math.max(70, (w * h) / 14000)));
  const particles = [];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.8, 2.2),
      vx: rand(-0.12, 0.25),  // gentle drift
      vy: rand(-0.05, 0.18),
      a: rand(0.25, 0.75)     // alpha
    });
  }

  // A subtle glow color family (blue/cyan)
  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(120, 210, 255, ${p.a})`;
    ctx.fill();
  }

  // Optional faint connection lines for "tech" vibe (kept minimal)
  function drawLinks() {
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist) {
          const t = 1 - dist / maxDist;
          ctx.strokeStyle = `rgba(80, 190, 255, ${0.08 * t})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(32, now - last);
    last = now;

    ctx.clearRect(0, 0, w, h);

    // Soft vignette to blend particles into banner
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.65, 0, w * 0.5, h * 0.65, Math.max(w, h));
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.25)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Update + draw
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // wrap edges
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      drawParticle(p);
    }

    drawLinks();

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
