/* Shared globe engine for the theme prototypes. Needs d3-array + d3-geo (global d3) and LAND. */
window.PAGlobe = function (canvas, opts) {
  var render = opts.render;
  var speed = opts.speed == null ? 3 : opts.speed; // deg / s
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var proj = d3.geoOrthographic().clipAngle(90).precision(0.4);
  var path = d3.geoPath(proj, ctx);
  var rot = (opts.start || [-140, 12]).concat([0]);
  var w = 0, h = 0, dpr = 1, raf = 0, last = 0, t = 0, running = false, onScreen = true;
  var intro = reduce || opts.intro === false ? 1 : 0;
  var introDur = opts.introDuration || 1.8;
  var drag = null, vel = [0, 0], idle = -1e9;

  function size() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    var scale = (opts.scale || 0.44) * Math.min(w, h);
    var off = (opts.offset && opts.offset(w, h)) || [0.5, 0.5];
    proj.scale(scale).translate([w * off[0], h * off[1]]);
    draw();
  }
  function draw() {
    if (!w) return;
    proj.rotate(rot);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    render({ ctx: ctx, proj: proj, path: path, w: w, h: h, t: t, intro: easeOut(intro), reduce: reduce, center: [-rot[0], -rot[1]] });
    if (opts.onCenter) opts.onCenter(-rot[1], -rot[0]);
  }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function frame(now) {
    var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; t += dt;
    if (intro < 1) intro = Math.min(1, intro + dt / introDur);
    if (!drag) {
      if (Math.abs(vel[0]) + Math.abs(vel[1]) > 0.02) { rot[0] += vel[0]; rot[1] = clamp(rot[1] + vel[1]); vel[0] *= 0.92; vel[1] *= 0.92; }
      else if (!reduce && now - idle > 2200) rot[0] += speed * dt;
    }
    draw();
    var settled = reduce && !drag && Math.abs(vel[0]) + Math.abs(vel[1]) <= 0.02;
    if (settled) running = false;
    raf = running ? requestAnimationFrame(frame) : 0;
  }
  function clamp(v) { return Math.max(-70, Math.min(70, v)); }
  function start() { if (running || !onScreen || document.hidden) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  canvas.addEventListener('pointerdown', function (e) {
    drag = [e.clientX, e.clientY]; vel = [0, 0];
    canvas.setPointerCapture(e.pointerId); canvas.classList.add('is-dragging'); start();
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var k = 70 / proj.scale();
    vel = [(e.clientX - drag[0]) * k, -(e.clientY - drag[1]) * k];
    rot[0] += vel[0]; rot[1] = clamp(rot[1] + vel[1]);
    drag = [e.clientX, e.clientY];
  });
  function up() { if (!drag) return; drag = null; idle = performance.now(); canvas.classList.remove('is-dragging'); }
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('keydown', function (e) {
    var m = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key];
    if (!m) return;
    e.preventDefault(); rot[0] -= m[0]; rot[1] = clamp(rot[1] + m[1]); idle = performance.now(); draw();
  });
  new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; onScreen ? start() : stop(); }).observe(canvas);
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  new ResizeObserver(size).observe(canvas);
  size();
  start();
  return { redraw: draw, rotateTo: function (lon, lat) { rot = [-lon, -lat, 0]; idle = performance.now(); start(); } };
};

PAGlobe.places = [
  { id: 'vn', vi: 'Việt Nam', en: 'Vietnam', lon: 107.8, lat: 16.05, approx: true },
  { id: 'nz', vi: 'New Zealand', en: 'New Zealand', lon: 174.0, lat: -41.3, approx: true, since: 2024 }
];
PAGlobe.fmt = function (lat, lon) {
  return Math.abs(lat).toFixed(2) + '°' + (lat >= 0 ? 'N' : 'S') + ' ' + Math.abs(lon).toFixed(2) + '°' + (lon >= 0 ? 'E' : 'W');
};

/* VI | EN switch: elements carry data-en; the Vietnamese text is in the HTML. */
window.PALang = function (buttons) {
  var nodes = document.querySelectorAll('[data-en]');
  nodes.forEach(function (n) { n.dataset.vi = n.innerHTML; });
  function set(lang) {
    document.documentElement.lang = lang;
    nodes.forEach(function (n) { n.innerHTML = lang === 'en' ? n.dataset.en : n.dataset.vi; });
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    document.dispatchEvent(new CustomEvent('pa:lang', { detail: lang }));
    try { localStorage.setItem('pa-lang', lang); } catch (e) {}
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.lang); }); });
  var saved = 'vi';
  try { saved = localStorage.getItem('pa-lang') || 'vi'; } catch (e) {}
  if (saved === 'en') set('en');
  return set;
};
