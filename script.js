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

  // Match your logo spheres: green, cyan/blue, purple
  const palette = [
    { r: 140, g: 255, b: 170 }, // green
    { r: 120, g: 215, b: 255 }, // cyan/blue
    { r: 195, g: 130, b: 255 }  // purple
  ];

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  const COUNT = Math.floor(Math.min(130, Math.max(70, (w * h) / 15000)));
  const particles = [];

  for (let i = 0; i < COUNT; i++) {
    particles.push(makeParticle(true));
  }

  function makeParticle(randomPos=false){
    const c = pick(palette);
    return {
      x: randomPos ? rand(0, w) : -20,
      y: randomPos ? rand(0, h) : rand(0, h),
      r: rand(0.9, 2.4),
      vx: rand(0.12, 0.55),
      vy: rand(-0.12, 0.22),
      a: rand(0.25, 0.75),
      c
    };
  }

  // Fade for comet trails (lower = longer trails)
  const FADE = 0.10;

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(32, now - last);
    last = now;

    // Fade previous frame instead of full clear
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      // comet stroke behind particle
      const tail = 12;
      const tx = p.x - p.vx * tail;
      const ty = p.y - p.vy * tail;

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = `rgba(${p.c.r}, ${p.c.g}, ${p.c.b}, ${Math.min(0.55, p.a)})`;
      ctx.lineWidth = Math.max(1, p.r);
      ctx.stroke();

      // dot glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c.r}, ${p.c.g}, ${p.c.b}, ${p.a})`;
      ctx.fill();

      // move
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // wrap
      if (p.x < -40) p.x = w + 40;
      if (p.x > w + 40) p.x = -40;
      if (p.y < -40) p.y = h + 40;
      if (p.y > h + 40) p.y = -40;
    }

    requestAnimationFrame(tick);
  }

  // Start clean
  ctx.clearRect(0, 0, w, h);
  requestAnimationFrame(tick);
})();


