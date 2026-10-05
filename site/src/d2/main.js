// @ts-nocheck: plain ES5 script, shared verbatim with the standalone preview
/* D2 · workbench page script. Expects globals d3 (geo functions), LAND, PAGlobe (globe-core.js). */
(function () {
  var root = document.documentElement, lang = root.lang === 'en' ? 'en' : 'vi', gl;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var C = {};
  function readColors() { var s = getComputedStyle(root); ['ink', 'ink-2', 'rule', 'band', 'accent', 'paper', 'sheet', 'pen', 'pencil'].forEach(function (k) { C[k] = s.getPropertyValue('--' + k).trim(); }); }
  readColors();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { readColors(); drawTiming(); });
  function dark() { return parseInt(C.paper.slice(1, 3), 16) < 0x80; }
  // words come from the Markdown text (src/content/home), filled in at build time as { key: [vi, en] }
  var TX = {}; try { TX = JSON.parse(document.getElementById('d2-text').textContent); } catch (e) {}
  function word(k) { var v = TX[k]; return v ? v[lang === 'en' ? 1 : 0] : k; }
  var HAND = '"Patrick Hand", cursive', MONO = '500 11px "Reddit Mono Variable", "Reddit Mono", monospace';

  // the standalone preview swaps language in place; the site ships one page per language
  if (window.PALang && document.querySelector('.lang button')) PALang([].slice.call(document.querySelectorAll('.lang button')));
  document.addEventListener('pa:lang', function (e) { lang = e.detail; gl && gl.redraw(); drawTiming(); setDistance(); marks(); });

  /* ---------- shared ticker ---------- */
  var jobs = [];
  function animate(el, fn) {
    var job = { fn: fn, on: false, t: 0 }; jobs.push(job);
    new IntersectionObserver(function (es) { job.on = es[0].isIntersecting; }).observe(el);
    new ResizeObserver(function () { fn(0, job.t); }).observe(el);
    return job;
  }
  if (!reduce) { var last = 0; (function tick(now) { var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; if (!document.hidden) jobs.forEach(function (j) { if (j.on) { j.t += dt; j.fn(dt, j.t); } }); requestAnimationFrame(tick); })(0); }
  function fit(c) {
    var r = c.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    if (c.width !== Math.round(r.width * dpr) || c.height !== Math.round(r.height * dpr)) { c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr); }
    var ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, r.width, r.height);
    return { ctx: ctx, w: r.width, h: r.height };
  }
  function pointer(c) {
    var p = { x: -1e4, y: -1e4, in: false, tap: 0 };
    function set(e) { var r = c.getBoundingClientRect(); p.x = e.clientX - r.left; p.y = e.clientY - r.top; }
    c.addEventListener('pointermove', function (e) { set(e); p.in = true; });
    c.addEventListener('pointerleave', function () { p.in = false; });
    c.addEventListener('pointerdown', function (e) { set(e); p.in = true; p.tap = 1; });
    return p;
  }

  /* ---------- chapters ease in once ---------- */
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -15% 0px' });
  document.querySelectorAll('section.ch').forEach(function (s) { reduce ? s.classList.add('on') : io.observe(s); });

  /* ---------- hand-drawn marks: red-pen circles and scribbled underlines ---------- */
  function rnd(seed) { return function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; }
  function roughEllipse(w, h, seed) {
    var r = rnd(seed), cx = w / 2, cy = h / 2, a0 = -2.2 + r() * 0.6, turns = 1.12, n = 40, d = '';
    var p1 = r() * 6, p2 = r() * 6;
    for (var i = 0; i <= n; i++) {
      var t = i / n, a = a0 + t * turns * Math.PI * 2, k = 1 + 0.05 * Math.sin(a * 2 + p1) + 0.04 * Math.sin(a * 3 + p2) + t * 0.06;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * (w / 2) * k).toFixed(1) + ' ' + (cy + Math.sin(a) * (h / 2) * k).toFixed(1);
    }
    return d;
  }
  function scribble(w, seed) {
    var r = rnd(seed), d = 'M0 ' + (4 + r() * 2).toFixed(1);
    for (var x = 10; x <= w; x += 10) d += ' L' + x + ' ' + (3 + Math.sin(x * 0.07 + r()) * 1.6 - x / w * 2).toFixed(1);
    d += ' M' + (w * 0.08).toFixed(1) + ' 10 L' + (w * 0.95).toFixed(1) + ' ' + (7 + r() * 2).toFixed(1);
    return d;
  }
  function marks() {
    document.querySelectorAll('.circ, .scrib').forEach(function (el, i) {
      var old = el.querySelector('.mk'); if (old) old.remove();
      var w = el.offsetWidth, h = el.offsetHeight, circ = el.classList.contains('circ');
      var pad = circ ? [14, 9] : [2, 0];
      var W = w + pad[0] * 2, H = circ ? h + pad[1] * 2 : 14;
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'mk'); svg.setAttribute('width', W); svg.setAttribute('height', H);
      svg.style.left = -pad[0] + 'px'; svg.style.top = circ ? -pad[1] + 'px' : (h - 6) + 'px';
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', circ ? roughEllipse(W, H, 7 + i * 13) : scribble(W, 11 + i));
      path.setAttribute('pathLength', '1');
      svg.appendChild(path); el.appendChild(svg);
    });
  }
  document.fonts && document.fonts.ready.then(marks); marks();
  addEventListener('resize', function () { clearTimeout(marks.t); marks.t = setTimeout(marks, 150); });

  /* ---------- header rider ---------- */
  var bot = document.getElementById('bot'), forms = bot.querySelectorAll('svg'), cur = -1;
  function ride() {
    var max = root.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, scrollY / max) : 0;
    bot.parentNode.style.setProperty('--x', (p * (bot.parentNode.getBoundingClientRect().width - 18)).toFixed(1) + 'px');
    var k = p < 0.3 ? 0 : p < 0.62 ? 1 : 2;
    if (k !== cur) { forms.forEach(function (f, i) { f.classList.toggle('on', i === k); }); cur = k; }
  }
  addEventListener('scroll', ride, { passive: true }); addEventListener('resize', ride); ride();

  /* ---------- hero globe ---------- */
  var grat = d3.geoGraticule10();
  var A = PAGlobe.places[0], B = PAGlobe.places[1];
  var journey = (function () { var f = d3.geoInterpolate([A.lon, A.lat], [B.lon, B.lat]), c = []; for (var i = 0; i <= 64; i++) c.push(f(i / 64)); return { type: 'LineString', coordinates: c }; })();
  gl = PAGlobe(document.getElementById('globe'), {
    start: [-140, 14], speed: 2.2, scale: 0.44, introDuration: 1.6,
    onCenter: function (lat, lon) { document.getElementById('center').textContent = PAGlobe.fmt(lat, lon); },
    render: function (s) {
      var ctx = s.ctx;
      ctx.beginPath(); s.path(grat); ctx.strokeStyle = C.rule; ctx.lineWidth = 0.7; ctx.stroke();
      ctx.globalAlpha = s.intro;
      ctx.beginPath(); s.path(LAND); ctx.fillStyle = C.band; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 0.9; ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath(); s.path({ type: 'Sphere' }); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.stroke();
      if (s.intro < 1) return;
      ctx.beginPath(); s.path(journey); ctx.strokeStyle = C.pen; ctx.lineWidth = 2; ctx.setLineDash([7, 5]); ctx.lineDashOffset = s.reduce ? 0 : -s.t * 10; ctx.stroke(); ctx.setLineDash([]);
      PAGlobe.places.forEach(function (pl) {
        if (d3.geoDistance([pl.lon, pl.lat], s.center) > Math.PI / 2 - 0.05) return;
        var p = s.proj([pl.lon, pl.lat]);
        ctx.strokeStyle = C.pen; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0.3, Math.PI * 2.15); ctx.stroke();
        ctx.fillStyle = C.ink; ctx.fillRect(p[0] - 2.5, p[1] - 2.5, 5, 5);
        ctx.font = '21px ' + HAND; ctx.fillStyle = C.pen;
        var label = pl[lang], tw = ctx.measureText(label).width;
        ctx.font = MONO;
        var sub = (pl.since ? pl.since + ' · ' : '') + '≈ ' + PAGlobe.fmt(pl.lat, pl.lon), sw = ctx.measureText(sub).width, right = p[0] + Math.max(tw, sw) + 24 < s.w;
        ctx.font = '21px ' + HAND; ctx.fillText(label, right ? p[0] + 15 : p[0] - 15 - tw, p[1] - 10);
        ctx.font = MONO; ctx.fillStyle = C['ink-2'];
        ctx.fillText(sub, right ? p[0] + 15 : p[0] - 15 - sw, p[1] + 6);
      });
    }
  });

  /* ---------- line follower: P control, the visitor tunes Kp ---------- */
  (function () {
    var c = document.getElementById('lf'), kpIn = document.getElementById('kp'), kpOut = document.getElementById('kpv'), stat = document.getElementById('lfstat');
    var N = 420, track = [], robot = null, err = 0, trail = [], hist = [], lastW = 0, lostT = 0, lost = 0, laps = 0, Kp = 7.5;
    kpIn.addEventListener('input', function () { Kp = +kpIn.value; kpOut.textContent = Kp.toFixed(1); });
    document.getElementById('lfreset').addEventListener('click', function () { reset(); lost = 0; });
    var H = 0;
    function build(w, h) {
      track = [];
      for (var i = 0; i < N; i++) {
        var a = i / N * Math.PI * 2, r = 1 + 0.17 * Math.sin(3 * a) + 0.07 * Math.cos(5 * a + 1);
        track.push([w / 2 + Math.cos(a) * r * w * 0.36, H / 2 + Math.sin(a) * r * H * 0.34]);
      }
    }
    function nearest(x, y) { var b = 1e9, bi = 0; for (var i = 0; i < N; i++) { var dx = track[i][0] - x, dy = track[i][1] - y, d = dx * dx + dy * dy; if (d < b) { b = d; bi = i; } } return [Math.sqrt(b), bi]; }
    function reset(i) {
      i = i || 0; var p0 = track[i], p1 = track[(i + 1) % N];
      robot = { x: p0[0], y: p0[1], a: Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) }; trail = []; err = 0; lostT = 0;
    }
    animate(c, function (dt) {
      var f = fit(c), ctx = f.ctx, w = f.w, h = f.h; if (!w) return;
      H = h * 0.76; var s = Math.min(w, H);
      if (w !== lastW) { lastW = w; build(w, h); reset(); hist = []; }
      var lw = s * 0.045;
      // floor: pencil grid
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.setLineDash([1, 4]); ctx.beginPath();
      for (var gx = 20; gx < w; gx += 20) { ctx.moveTo(gx, 0); ctx.lineTo(gx, H); }
      for (var gy = 20; gy < H; gy += 20) { ctx.moveTo(0, gy); ctx.lineTo(w, gy); }
      ctx.stroke(); ctx.setLineDash([]);
      // electrical tape on the floor: slightly uneven
      ctx.beginPath(); track.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath();
      ctx.strokeStyle = C.ink; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.strokeStyle = dark() ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.18)'; ctx.lineWidth = lw * 0.25; ctx.setLineDash([14, 22]); ctx.stroke(); ctx.setLineDash([]);
      // sense
      var L = s * 0.12, W = s * 0.09, sp = W * 0.26, ahead = L * 0.62;
      var fx = Math.cos(robot.a), fy = Math.sin(robot.a), nx = -fy, ny = fx, hits = [], sum = 0, cnt = 0;
      for (var k = -2; k <= 2; k++) { var on = nearest(robot.x + fx * ahead + nx * k * sp, robot.y + fy * ahead + ny * k * sp)[0] < lw / 2; hits.push(on); if (on) { sum += k; cnt++; } }
      if (cnt) err = sum / cnt / 2;
      // act
      robot.a += Kp * err * dt;
      robot.x += fx * s * 0.42 * dt; robot.y += fy * s * 0.42 * dt;
      var nr = nearest(robot.x, robot.y);
      if (nr[0] > lw * 3) lostT += dt; else lostT = 0;
      if (lostT > 0.9 || robot.x < -40 || robot.x > w + 40 || robot.y < -40 || robot.y > H + 40) { lost++; reset(nr[1]); }
      if (dt) { trail.push([robot.x, robot.y]); if (trail.length > 70) trail.shift(); hist.push(err); if (hist.length > 260) hist.shift(); }
      ctx.beginPath(); trail.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.strokeStyle = C.pen; ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
      // robot
      ctx.save(); ctx.translate(robot.x, robot.y); ctx.rotate(robot.a);
      ctx.lineWidth = 1.4; ctx.strokeStyle = C.ink; ctx.fillStyle = C.sheet;
      ctx.fillRect(-L / 2, -W / 2, L, W); ctx.strokeRect(-L / 2, -W / 2, L, W);
      ctx.fillStyle = C.ink; ctx.fillRect(-L * 0.34, -W * 0.74, L * 0.36, W * 0.2); ctx.fillRect(-L * 0.34, W * 0.54, L * 0.36, W * 0.2);
      ctx.beginPath(); ctx.arc(-L * 0.05, 0, W * 0.16, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(L / 2, 0); ctx.lineTo(ahead, 0); ctx.stroke();
      ctx.fillStyle = C.sheet; ctx.fillRect(ahead - 3, -W * 0.64, 6, W * 1.28); ctx.strokeRect(ahead - 3, -W * 0.64, 6, W * 1.28);
      hits.forEach(function (on, i) { ctx.fillStyle = on ? C.pen : C.sheet; ctx.beginPath(); ctx.arc(ahead, (i - 2) * sp, 2.8, 0, 7); ctx.fill(); ctx.stroke(); });
      ctx.restore();
      // e(t) strip
      var y0 = H + 10, sh = h - y0 - 4;
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y0 + sh / 2); ctx.lineTo(w, y0 + sh / 2); ctx.stroke();
      ctx.strokeStyle = C.accent; ctx.lineWidth = 1.6; ctx.beginPath();
      hist.forEach(function (e, i) { var x = w - (hist.length - i) * (w / 260), y = y0 + sh / 2 - e * sh * 0.45; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke();
      ctx.font = MONO; ctx.fillStyle = C['ink-2']; ctx.fillText('e(t)', 4, y0 + 11);
      stat.textContent = 'IR ' + hits.map(function (b) { return b ? '■' : '□'; }).join('') + '  e=' + (err >= 0 ? '+' : '') + err.toFixed(2) + '  ' + ((word('sinh-vien-robot.hd-lac') + ' ')) + lost;
      if (lostT > 0.2) { ctx.font = '24px ' + HAND; ctx.fillStyle = C.pen; ctx.fillText(word('sinh-vien-robot.hd-lac-roi'), robot.x + 16, robot.y - 14); }
    });
  })();

  /* ---------- UAV: tri-rotor PD hover hold; the visitor is the wind. REAL LIFE shows it never quite flew ---------- */
  (function () {
    var c = document.getElementById('uav'), stat = document.getElementById('uavstat'), ptr = pointer(c);
    var bSim = document.getElementById('uavsim'), bReal = document.getElementById('uavreal');
    var pos = null, vel = [0, 0], trail = [], gust = 0, real = false, rt = 0, tries = 0, yawOff = 0;
    function mode(r) { real = r; rt = 0; tries = r ? 1 : 0; yawOff = 0; trail = []; bSim.setAttribute('aria-pressed', !r); bReal.setAttribute('aria-pressed', r); }
    bSim.addEventListener('click', function () { mode(false); });
    bReal.addEventListener('click', function () { mode(true); });
    animate(c, function (dt, t) {
      var f = fit(c), ctx = f.ctx, w = f.w, h = f.h, s = Math.min(w, h); if (!w) return;
      var tx = w * 0.5 + Math.sin(t * 0.4) * w * 0.07, ty = h * 0.5 + Math.sin(t * 0.6) * h * 0.05;
      if (!pos) pos = [tx, ty];
      var tilt = 0, pitch = 0, alt = 1, spin = 1, wind = 0, note = '', jit = [0, 0];
      if (!real) {
        var ax = -9 * (pos[0] - tx) - 3.6 * vel[0], ay = -9 * (pos[1] - ty) - 3.6 * vel[1];
        if (ptr.in) {
          var dx = pos[0] - ptr.x, dy = pos[1] - ptr.y, d = Math.hypot(dx, dy) || 1, Rw = s * 0.55;
          if (d < Rw) { wind = (1 - d / Rw); ax += dx / d * s * 14 * wind; ay += dy / d * s * 14 * wind; }
          if (ptr.tap) { vel[0] += dx / d * s * 2.2; vel[1] += dy / d * s * 2.2; ptr.tap = 0; gust = 1; }
        }
        gust = Math.max(0, gust - dt * 1.5);
        vel[0] += ax * dt; vel[1] += ay * dt; pos[0] += vel[0] * dt; pos[1] += vel[1] * dt;
        pos[0] = Math.max(s * 0.2, Math.min(w - s * 0.2, pos[0])); pos[1] = Math.max(s * 0.2, Math.min(h - s * 0.2, pos[1]));
        tilt = Math.max(-1, Math.min(1, -vel[0] / (s * 1.2))); pitch = Math.max(-1, Math.min(1, -vel[1] / (s * 1.2)));
      } else {
        // spool up, a shaky hop, tip over, sit there. Repeat.
        ptr.tap = 0; vel = [0, 0]; pos = [w * 0.5, h * 0.52];
        rt += dt; if (rt > 5.2) { rt = 0; tries++; yawOff = 0; }
        var k;
        if (rt < 1) { k = rt; spin = k; alt = 0; jit = [(Math.random() - 0.5) * 1.6 * k, (Math.random() - 0.5) * 1.6 * k]; }
        else if (rt < 2.3) { k = (rt - 1) / 1.3; spin = 1.4; alt = Math.sin(k * Math.PI) * 0.45; tilt = Math.sin(rt * 17) * k * 0.9; pitch = Math.cos(rt * 13) * k * 0.6; yawOff += dt * k * 3.2; }
        else if (rt < 2.6) { k = (rt - 2.3) / 0.3; spin = 1 - k; alt = 0; tilt = 0.9 + k * 0.3; pitch = 0.3; note = word('sinh-vien-uav.hd-cham-dat'); }
        else { spin = 0; alt = 0; tilt = 1.2; pitch = 0.3; note = word('sinh-vien-uav.hd-ket-qua'); }
        if (dt && alt > 0.02) { trail.push([pos[0] + tilt * s * 0.05, pos[1] - alt * s * 0.1]); if (trail.length > 80) trail.shift(); }
      }
      if (!real && dt) { trail.push(pos.slice()); if (trail.length > 160) trail.shift(); }
      // set point (sim) or the floor marker (real)
      ctx.strokeStyle = C.pen; ctx.lineWidth = 1.2; ctx.beginPath();
      if (!real) { ctx.moveTo(tx - 7, ty); ctx.lineTo(tx + 7, ty); ctx.moveTo(tx, ty - 7); ctx.lineTo(tx, ty + 7); }
      else { ctx.setLineDash([4, 4]); ctx.arc(w * 0.5, h * 0.52, s * 0.3, 0, 7); }
      ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); trail.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.strokeStyle = C.accent; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
      if (ptr.in && wind > 0) {
        ctx.strokeStyle = C.pencil; ctx.lineWidth = 1; ctx.globalAlpha = 0.6;
        for (var q = -2; q <= 2; q++) {
          var ang = Math.atan2(pos[1] - ptr.y, pos[0] - ptr.x) + q * 0.12, ph = (t * 3 + q * 0.3) % 1, r0 = 14 + ph * 40;
          ctx.beginPath(); ctx.moveTo(ptr.x + Math.cos(ang) * r0, ptr.y + Math.sin(ang) * r0); ctx.lineTo(ptr.x + Math.cos(ang) * (r0 + 16), ptr.y + Math.sin(ang) * (r0 + 16)); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      // Y3 layout: two front arms at ±60°, one tail arm; the tail motor tilts on a servo
      var yaw = -Math.PI / 2 + Math.sin(t * 0.3) * 0.25 + yawOff, sc = 1 + alt * 0.12, R = s * 0.2 * sc, r = s * 0.08 * sc;
      var cx = pos[0] + jit[0], cy = pos[1] + jit[1] - alt * s * 0.1, sh = real ? 3 + alt * 40 : 18;
      var arms = [yaw + Math.PI / 3, yaw - Math.PI / 3, yaw + Math.PI], servo = real ? Math.sin(t * 9) * 0.5 * spin : Math.sin(t * 0.3 + 1) * 0.35 - tilt * 0.3;
      ctx.fillStyle = '#000'; ctx.globalAlpha = dark() ? 0.4 : 0.07;
      arms.forEach(function (a) { ctx.beginPath(); ctx.arc(pos[0] + sh * 0.7 + Math.cos(a) * R, pos[1] + sh + Math.sin(a) * R, r, 0, 7); ctx.fill(); });
      ctx.globalAlpha = 1;
      var pts = arms.map(function (a) { return [cx + Math.cos(a) * R * (1 + tilt * Math.cos(a) * 0.12), cy + Math.sin(a) * R * (1 + pitch * Math.sin(a) * 0.12)]; });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4; ctx.beginPath(); pts.forEach(function (p) { ctx.moveTo(cx, cy); ctx.lineTo(p[0], p[1]); }); ctx.stroke();
      pts.forEach(function (p, i) {
        var a = arms[i], effort = (1 + Math.max(0, (Math.cos(a) * tilt + Math.sin(a) * pitch)) * 2 + gust) * spin;
        ctx.save(); ctx.translate(p[0], p[1]);
        if (i === 2) { ctx.rotate(a); ctx.scale(1 - Math.abs(servo) * 0.35, 1); ctx.rotate(-a); }
        ctx.fillStyle = C.band; ctx.strokeStyle = i === 2 ? C.pen : C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.stroke();
        var dir = i === 1 ? -1 : 1, an = t * 34 * effort * dir;
        for (var g = 0; g < 3; g++) { var b = an - dir * g * 0.24; ctx.globalAlpha = g ? (spin > 0.3 ? 0.25 : 0) : 1; ctx.strokeStyle = C.ink; ctx.lineWidth = g ? 1 : 1.7; ctx.beginPath(); ctx.moveTo(-Math.cos(b) * r * 0.9, -Math.sin(b) * r * 0.9); ctx.lineTo(Math.cos(b) * r * 0.9, Math.sin(b) * r * 0.9); ctx.stroke(); }
        ctx.restore();
        ctx.globalAlpha = 1; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(p[0], p[1], 2.2, 0, 7); ctx.fill();
      });
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(yaw);
      var bw = s * 0.05 * sc; ctx.fillStyle = C.sheet; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.beginPath();
      for (var v = 0; v < 6; v++) { var va = v * Math.PI / 3; v ? ctx.lineTo(Math.cos(va) * bw, Math.sin(va) * bw) : ctx.moveTo(Math.cos(va) * bw, Math.sin(va) * bw); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.pen; ctx.beginPath(); ctx.moveTo(bw * 1.8, 0); ctx.lineTo(bw * 1.15, -bw * 0.45); ctx.lineTo(bw * 1.15, bw * 0.45); ctx.fill();
      ctx.restore();
      if (note) { ctx.font = '26px ' + HAND; ctx.fillStyle = C.pen; ctx.fillText(note, cx + R * 0.6, cy - R * 1.1); }
      if (!real) {
        var off = Math.hypot(pos[0] - tx, pos[1] - ty) / s;
        stat.textContent = ((word('sinh-vien-uav.hd-lech') + ' ')) + (off * 100).toFixed(0) + '%  roll ' + (tilt * 20).toFixed(1) + '°  tail servo ' + (servo * 30).toFixed(0) + '°';
      } else stat.textContent = ((word('sinh-vien-uav.hd-lan-thu') + ' ')) + tries + ((' ' + word('sinh-vien-uav.hd-chua-cat-canh')));
    });
  })();

  /* ---------- rough 3D: pencil wireframes you can turn ---------- */
  function model(c, build, labels) {
    var yaw = 0.7, pitch = 0.36, drag = null, idle = 9, segs;
    c.addEventListener('pointerdown', function (e) { drag = [e.clientX, e.clientY]; idle = 0; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', function (e) {
      if (!drag) return; yaw -= (e.clientX - drag[0]) * 0.012;
      if (e.pointerType === 'mouse') pitch = Math.max(0.05, Math.min(1.2, pitch + (e.clientY - drag[1]) * 0.008));
      drag = [e.clientX, e.clientY]; idle = 0;
    });
    c.addEventListener('pointerup', function () { drag = null; }); c.addEventListener('pointercancel', function () { drag = null; });
    // geometry helpers. y is up; st: 0 ink, 1 red pen, 2 pencil, 3 thick ink
    function add(a, b, st) { segs.push([a, b, st || 0]); }
    var G = {
      line: add,
      poly: function (p, closed, st) { for (var i = 0; i < p.length - (closed ? 0 : 1); i++) add(p[i], p[(i + 1) % p.length], st); },
      box: function (x, y, z, a, b, d, st) {
        a /= 2; b /= 2; d /= 2; var v = []; for (var i = 0; i < 8; i++) v.push([x + (i & 1 ? a : -a), y + (i & 2 ? b : -b), z + (i & 4 ? d : -d)]);
        [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(function (e) { add(v[e[0]], v[e[1]], st); });
      },
      extrude: function (p, y0, y1, st) { G.poly(p.map(function (q) { return [q[0], y0, q[1]]; }), 1, st); G.poly(p.map(function (q) { return [q[0], y1, q[1]]; }), 1, st); p.forEach(function (q) { add([q[0], y0, q[1]], [q[0], y1, q[1]], st); }); },
      // ring of radius r around axis u through centre o
      ring: function (o, u, r, n, st, from, to) {
        var b = basis(u), p = []; from = from || 0; to = to == null ? Math.PI * 2 : to;
        for (var i = 0; i <= n; i++) { var a = from + (to - from) * i / n; p.push(o.map(function (oc, k) { return oc + (b[0][k] * Math.cos(a) + b[1][k] * Math.sin(a)) * r; })); }
        G.poly(p, 0, st); return p;
      },
      cyl: function (o, u, r, len, n, st, rays) {
        var e = o.map(function (oc, k) { return oc + u[k] * len; }), A = G.ring(o, u, r, n, st), B = G.ring(e, u, r, n, st);
        for (var i = 0; i < n; i += Math.max(1, Math.floor(n / (rays || 6)))) add(A[i], B[i], st);
        return e;
      },
      on: function (o, u, r, a) { var b = basis(u); return o.map(function (oc, k) { return oc + (b[0][k] * Math.cos(a) + b[1][k] * Math.sin(a)) * r; }); }
    };
    function basis(u) {
      var t = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      var a = [u[1] * t[2] - u[2] * t[1], u[2] * t[0] - u[0] * t[2], u[0] * t[1] - u[1] * t[0]], l = Math.hypot(a[0], a[1], a[2]); a = a.map(function (x) { return x / l; });
      return [a, [u[1] * a[2] - u[2] * a[1], u[2] * a[0] - u[0] * a[2], u[0] * a[1] - u[1] * a[0]]];
    }
    animate(c, function (dt, t) {
      var f = fit(c), ctx = f.ctx, w = f.w, h = f.h; if (!w) return;
      idle += dt; if (!drag && idle > 2.5) yaw += dt * 0.3;
      segs = []; var meta = build(G, t) || {};
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), D = 900, S = Math.min(w, h) / (meta.size || 360);
      function P(v) {
        var x = v[0] * cy - v[2] * sy, z = v[0] * sy + v[2] * cy, y = v[1] * cp - z * sp, zz = v[1] * sp + z * cp, k = D / (D + zz);
        return [w / 2 + x * k * S, h * (meta.cy || 0.55) - y * k * S, zz];
      }
      var col = [C.ink, C.pen, C.pencil, C.ink], lw = [1.5, 1.7, 0.9, 6];
      segs.forEach(function (sg, i) {
        var a = P(sg[0]), b = P(sg[1]), st = sg[2], depth = (a[2] + b[2]) / 2 / (meta.size || 360);
        ctx.strokeStyle = col[st]; ctx.lineCap = 'round';
        ctx.globalAlpha = st === 2 ? 0.55 : Math.max(0.35, Math.min(1, 0.8 - depth * 0.9));
        // two slightly different passes: a pencil line, not a vector line
        for (var pass = 0; pass < (st === 2 ? 1 : 2); pass++) {
          var j = pass ? 0.9 : 0.35, h1 = Math.sin(i * 12.99 + pass * 7.1) * j, h2 = Math.cos(i * 78.23 + pass * 3.7) * j;
          ctx.lineWidth = pass ? lw[st] * 0.55 : lw[st];
          ctx.beginPath(); ctx.moveTo(a[0] + h1, a[1] + h2); ctx.lineTo(b[0] - h2, b[1] + h1); ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
      (labels || []).forEach(function (L) {
        var p = P(L.at), tx = p[0] + L.dx, ty = p[1] + L.dy, txt = word(L.k);
        ctx.strokeStyle = C.pen; ctx.fillStyle = C.pen; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.quadraticCurveTo(p[0] + L.dx * 0.2, ty, tx - (L.dx < 0 ? -4 : 4), ty); ctx.stroke();
        ctx.beginPath(); ctx.arc(p[0], p[1], 2.4, 0, 7); ctx.fill();
        ctx.font = '19px ' + HAND; var tw = ctx.measureText(txt).width; ctx.fillText(txt, L.dx < 0 ? tx - tw - 6 : tx + 6, ty + 6);
      });
    });
  }

  // line follower, mm-ish, drawn from memory: plate, two drive wheels, a caster, 5 IR sensors up front
  model(document.getElementById('m-lf'), function (G, t) {
    for (var gx = -160; gx <= 160; gx += 40) G.line([gx, -38, -120], [gx, -38, 120], 2);
    for (var gz = -120; gz <= 120; gz += 40) G.line([-160, -38, gz], [160, -38, gz], 2);
    var tape = []; for (var x = -170; x <= 170; x += 10) tape.push([x, -38, Math.sin((x + t * 60) / 70) * 22]); G.poly(tape, 0, 3);
    G.extrude([[-72, -46], [40, -46], [72, -24], [72, 24], [40, 46], [-72, 46]], 0, 4);
    [-1, 1].forEach(function (sd) {
      var o = [-35, -6, sd * 52], a = -t * 4;
      var e = G.cyl(o, [0, 0, sd], 32, 12, 22, 0, 22);
      for (var k = 0; k < 3; k++) G.line(e, G.on(e, [0, 0, sd], 30, a + k * 2.09));
      G.box(-35, -12, sd * 30, 44, 20, 22);
    });
    G.line([56, 0, 0], [56, -22, 0]); G.ring([56, -30, 0], [0, 0, 1], 8, 12); G.ring([56, -30, 0], [1, 0, 0], 8, 12);
    G.box(-40, 14, 0, 46, 20, 30); G.box(12, 5, 0, 58, 2, 46); G.box(12, 8, 0, 18, 4, 10);
    for (var p = -18; p <= 18; p += 6) G.line([34, 6, p], [34, 10, p], 2);
    [-14, 14].forEach(function (z) { G.line([68, 0, z], [80, -26, z]); });
    G.box(80, -28, 0, 10, 3, 92);
    for (var s = -2; s <= 2; s++) G.cyl([80, -30, s * 18], [0, -1, 0], 3.5, 5, 8, 1, 2);
    G.poly([[20, 9, 0], [50, 22, 0], [78, -24, 0]], 0, 1);
    return { size: 255 };
  }, [{ at: [80, -30, 36], dx: 46, dy: -6, k: 'sinh-vien-robot.hd-nhan-cam-bien' }, { at: [-35, 26, 58], dx: -30, dy: -28, k: 'sinh-vien-robot.hd-nhan-banh-xe' }]);

  // tri-rotor (Y3), drawn from memory: three arms, the tail motor tilts on a servo for yaw
  model(document.getElementById('m-tri'), function (G, t) {
    for (var gx = -150; gx <= 150; gx += 50) G.line([gx, -46, -150], [gx, -46, 150], 2);
    for (var gz = -150; gz <= 150; gz += 50) G.line([-150, -46, gz], [150, -46, gz], 2);
    var hex = []; for (var i = 0; i < 6; i++) hex.push([Math.cos(i * Math.PI / 3) * 40, Math.sin(i * Math.PI / 3) * 40]);
    G.extrude(hex, 0, 3); G.extrude(hex.map(function (q) { return [q[0] * 0.8, q[1] * 0.8]; }), 16, 19);
    for (i = 0; i < 6; i += 2) G.line([hex[i][0] * 0.8, 3, hex[i][1] * 0.8], [hex[i][0] * 0.8, 16, hex[i][1] * 0.8], 2);
    G.box(0, 22, 0, 30, 3, 30); G.poly([[22, 24, 0], [14, 24, -5], [14, 24, 5]], 1, 1);
    G.box(0, -12, 0, 70, 18, 32);
    var arms = [Math.PI / 3, -Math.PI / 3, Math.PI], servo = Math.sin(t * 1.4) * 0.35;
    arms.forEach(function (a, k) {
      var d = [Math.cos(a), 0, Math.sin(a)], n = [-d[2], 0, d[0]];
      function at(r, y, o) { return [d[0] * r + n[0] * o, y, d[2] * r + n[2] * o]; }
      G.box && [[-5, 3], [5, 3], [-5, 10], [5, 10]].forEach(function (q) { G.line(at(36, q[1], q[0]), at(168, q[1], q[0])); });
      G.line(at(168, 3, -5), at(168, 3, 5)); G.line(at(168, 10, -5), at(168, 10, 5));
      G.line(at(80, 3, 0), at(80, -46, 0)); G.line(at(80, -46, -12), at(80, -46, 12));
      var up = [0, 1, 0];
      if (k === 2) { up = [n[0] * Math.sin(servo), Math.cos(servo), n[2] * Math.sin(servo)]; G.box(d[0] * 145, -2, d[2] * 145, 16, 12, 16, 1); }
      var top = G.cyl(at(168, 10, 0), up, 14, 20, 14, k === 2 ? 1 : 0, 4);
      var spin = t * (k === 1 ? -14 : 14);
      G.ring(top, up, 66, 28, 2);
      for (var b = 0; b < 2; b++) G.line(G.on(top, up, 64, spin + b * Math.PI), top);
    });
    return { size: 340 };
  }, [{ at: [-168, 30, 0], dx: -10, dy: -58, k: 'sinh-vien-uav.hd-nhan-servo' }]);

  /* ---------- 2019: a damped response written by a sweeping trace ---------- */
  (function () {
    var c = document.getElementById('settle');
    animate(c, function (dt, t) {
      var f = fit(c), ctx = f.ctx, w = f.w, h = f.h; if (!w) return;
      ctx.strokeStyle = 'rgba(190,220,210,.14)'; ctx.lineWidth = 1; ctx.setLineDash([1, 3]); ctx.beginPath();
      for (var i = 1; i < 20; i++) { ctx.moveTo(w * i / 20, 0); ctx.lineTo(w * i / 20, h); }
      for (var j = 1; j < 6; j++) { ctx.moveTo(0, h * j / 6); ctx.lineTo(w, h * j / 6); }
      ctx.stroke(); ctx.setLineDash([]);
      var period = 9, p = reduce ? 1 : Math.min(1, (t % period) / (period * 0.8));
      function y(x) { var u = x * 14; return h / 2 - Math.exp(-u * 0.28) * Math.sin(u * 1.9) * h * 0.42 + (1 - Math.exp(-u * 0.6)) * 0; }
      ctx.strokeStyle = '#e64aa9'; ctx.shadowColor = '#e64aa9'; ctx.shadowBlur = 6; ctx.lineWidth = 2;
      ctx.beginPath();
      for (var x = 0; x <= w * p; x += 2) { var yy = y(x / w) + (Math.random() - 0.5) * 1.2; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
      ctx.stroke(); ctx.shadowBlur = 0;
      if (p < 1) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(w * p, y(p), 3, 0, 7); ctx.fill(); }
    });
  })();

  /* ---------- 2022: my own error signal, drawn as the reader scrolls ---------- */
  (function () {
    var c = document.getElementById('err'), sec = document.getElementById('ch-2022'), shown = reduce ? 1 : 0;
    var noise = []; for (var i = 0; i < 400; i++) noise.push(Math.sin(i * 12.9898) * 43758.5453 % 1);
    // e(u), u in 0..1: calm, a spike in 2022, then a slow, noisy settling that has not reached zero
    function e(u) {
      var k = 0.14; if (u < k) return 0.06 * Math.sin(u * 60);
      var v = (u - k) / (1 - k);
      return Math.exp(-v * 2.6) * Math.cos(v * 26) * 0.92 + 0.11 * (1 - v * 0.4) + noise[Math.floor(u * 399)] * 0.05 * Math.exp(-v * 1.5);
    }
    animate(c, function (dt) {
      var r = sec.getBoundingClientRect(), vh = innerHeight;
      var target = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.9 - r.top) / Math.max(1, r.height * 0.32)));
      shown += (Math.max(shown, target) - shown) * Math.min(1, dt * 4 || 1);
      var f = fit(c), ctx = f.ctx, w = f.w, h = f.h; if (!w) return;
      var L = 34, R = w - 14, T = 18, B = h - 30, z = (T + B) / 2 + (B - T) * 0.12, A = (B - T) * 0.5;
      var X = function (u) { return L + u * (R - L); }, Y = function (v) { return z - v * A; };
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.setLineDash([2, 4]); ctx.beginPath();
      [0.14, 0.42, 0.62, 0.82].forEach(function (u) { ctx.moveTo(X(u), T); ctx.lineTo(X(u), B); });
      ctx.stroke();
      ctx.strokeStyle = C['ink-2']; ctx.beginPath(); ctx.moveTo(L, z); ctx.lineTo(R, z); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = MONO; ctx.fillStyle = C['ink-2']; ctx.textAlign = 'right'; ctx.fillText('0', L - 8, z + 4);
      ctx.fillText('e', L - 8, T + 8); ctx.textAlign = 'left';
      [[0.14, '2022'], [0.42, '2023'], [0.62, '2024'], [0.82, '2025']].forEach(function (m) { ctx.fillText(m[1], X(m[0]) - 14, B + 18); });
      ctx.textAlign = 'right'; ctx.fillText(word('2022.hd-nay'), R, B + 18); ctx.textAlign = 'left';
      // trace
      var p = shown, n = Math.max(2, Math.floor((R - L) * p / 2));
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.8; ctx.lineJoin = 'round'; ctx.beginPath();
      for (var j = 0; j <= n; j++) { var u = j / n * p; j ? ctx.lineTo(X(u), Y(e(u))) : ctx.moveTo(X(u), Y(e(u))); }
      ctx.stroke();
      if (p > 0.16) { // red pen at the spike
        ctx.strokeStyle = C.pen; ctx.fillStyle = C.pen; ctx.lineWidth = 1.6; ctx.beginPath();
        ctx.ellipse(X(0.145), Y(e(0.14)) + 4, 16, 22, -0.2, 0, Math.PI * 2 * Math.min(1, (p - 0.16) * 8)); ctx.stroke();
        ctx.font = '20px ' + HAND; ctx.fillText(word('2022.hd-o-day'), X(0.145) + 22, Y(e(0.14)) - 8);
      }
      var u1 = p, ex = X(u1), ey = Y(e(u1));
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(ex, ey, 3.5, 0, 7); ctx.fill();
      if (p > 0.92) {
        var a = Math.min(1, (p - 0.92) * 14); ctx.globalAlpha = a;
        ctx.fillStyle = C.pen; ctx.strokeStyle = C.pen; ctx.font = '20px ' + HAND; ctx.textAlign = 'right';
        ctx.fillText(word('2022.hd-chua-ve-0'), R - 4, T + 18);
        ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(R - 40, T + 26); ctx.quadraticCurveTo(R - 30, ey - 30, ex - 4, ey - 8); ctx.stroke();
        ctx.textAlign = 'left'; ctx.globalAlpha = 1;
      }
    });
  })();

  /* ---------- 2024: pencil route map ---------- */
  var distKm = Math.round(d3.geoDistance([A.lon, A.lat], [B.lon, B.lat]) * 6371 / 100) * 100;
  function setDistance() { document.getElementById('dist').textContent = distKm.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN') + ' km'; marks(); }
  setDistance();
  (function () {
    var c = document.getElementById('route'), drawn = reduce ? 1 : 0, started = false;
    var sec = document.getElementById('ch-2024');
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) started = true; }, { threshold: 0.35 }).observe(c);
    var region = { type: 'MultiPoint', coordinates: [[94, 30], [180, -50]] };
    var arc = (function () { var f = d3.geoInterpolate([A.lon, A.lat], [B.lon, B.lat]), cc = []; for (var i = 0; i <= 80; i++) cc.push(f(i / 80)); return cc; })();
    animate(c, function (dt) {
      var f = fit(c), ctx = f.ctx, w = f.w, h = f.h; if (!w) return;
      if (started) drawn = Math.min(1, drawn + dt / 2.4);
      var proj = d3.geoEquirectangular().fitExtent([[16, 16], [w - 16, h - 16]], region), path = d3.geoPath(proj, ctx);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
      ctx.beginPath(); path(d3.geoGraticule().step([10, 10])()); ctx.strokeStyle = C.rule; ctx.lineWidth = 0.6; ctx.stroke();
      ctx.beginPath(); path(LAND); ctx.fillStyle = C.band; ctx.fill(); ctx.strokeStyle = C.pencil; ctx.lineWidth = 1; ctx.stroke();
      var n = Math.max(1, Math.round(arc.length * drawn));
      ctx.beginPath(); for (var i = 0; i < n; i++) { var p = proj(arc[i]); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      ctx.strokeStyle = C.pen; ctx.lineWidth = 2.4; ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([]);
      var a = proj([A.lon, A.lat]), b = proj([B.lon, B.lat]), head = proj(arc[n - 1]);
      ctx.strokeStyle = C.pen; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(a[0], a[1], 9, 0.4, 6.6); ctx.stroke();
      if (drawn >= 1) { ctx.beginPath(); ctx.arc(b[0], b[1], 10, 0.2, 6.5); ctx.stroke(); }
      else { ctx.fillStyle = C.pen; ctx.beginPath(); ctx.arc(head[0], head[1], 4, 0, 7); ctx.fill(); }
      ctx.font = '22px ' + HAND; ctx.fillStyle = C.ink;
      ctx.fillText(A[lang], a[0] + 14, a[1] - 8);
      if (drawn >= 1) ctx.fillText(B[lang], b[0] - ctx.measureText(B[lang]).width - 14, b[1] + 6);
      ctx.restore();
    });
  })();

  /* ---------- loop signal ---------- */
  (function () {
    var sig = document.getElementById('sig'), pts = [[8, 100], [72, 100], [490, 100], [490, 200], [72, 200], [72, 100]], lens = [], tot = 0;
    for (var i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); tot += l; }
    animate(sig.ownerSVGElement, function (dt, t) {
      var d = ((t / 6) % 1) * tot;
      for (var k = 0; k < lens.length; k++) { if (d <= lens[k]) { var f = d / lens[k]; sig.setAttribute('cx', pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f); sig.setAttribute('cy', pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f); return; } d -= lens[k]; }
    });
  })();

  /* ---------- someday: a short play. it sees you, learns a move from your hand, then lifts a plank with you ---------- */
  (function () {
    var c = document.getElementById('hu'), ptr = pointer(c), quest = [].slice.call(document.querySelectorAll('#quest li')), qend = document.getElementById('qend');
    var JOINTS = ['lS', 'lE', 'lW', 'rS', 'rE', 'rW', 'lH', 'lK', 'lA', 'rH', 'rK', 'rA'], pulses = [], glow = {}, net = 0, nextFire = 0.4, look = 0, wv = 0, stay = 0, focused = false;
    var L1 = 17, L2 = 15, X0 = -4, PL = 46, REST = 58, GOAL = 40;
    var stage, phase, phaseT, bub, grab, rec, play, aim, arm, shift, pk, geo = null, hailed, quiet;
    function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    function say(txt, live) { if (bub && bub.txt === txt && bub.live === !!live) return; bub = { txt: txt, at: live && bub && bub.live ? bub.at : job.t, live: !!live }; }
    function along(pts, p) {
      var lens = [], tot = 0; for (var i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); tot += l; }
      var d = p * tot; for (var k = 0; k < lens.length; k++) { if (d <= lens[k]) { var q = d / (lens[k] || 1); return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * q, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * q]; } d -= lens[k]; }
      return pts[pts.length - 1];
    }
    // two-link arm in body units; angles are measured from straight down, positive = away from the body
    function ik(side, tx, ty) {
      var x = (tx - side * 14) * side, y = ty - 30, d0 = Math.hypot(x, y), d = Math.max(3, Math.min(L1 + L2 - 0.01, d0)), k = d / (d0 || 1);
      var th = Math.atan2(x, y), A = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)))), best = null;
      [th - A, th + A].forEach(function (a1) { var ex = Math.sin(a1), ey = Math.cos(a1), s = ex * 0.6 + ey; if (!best || s > best.s) best = { s: s, a1: a1, a2: Math.atan2(x * k - L1 * ex, y * k - L1 * ey) }; });
      return [best.a1, best.a2];
    }
    function wrist(side, a) { return [side * (14 + L1 * Math.sin(a[0]) + L2 * Math.sin(a[1])), 30 + L1 * Math.cos(a[0]) + L2 * Math.cos(a[1])]; }
    function ease(a, tgt, k) { a[0] += (tgt[0] - a[0]) * k; a[1] += (tgt[1] - a[1]) * k; }
    function setStage(s) {
      stage = s; phase = ''; phaseT = 0; grab = null;
      quest.forEach(function (li, i) { li.className = i < s ? 'done' : i === s ? 'now' : ''; });
      qend.classList.toggle('on', s >= 3);
      if (s === 1) say(word('mot-ngay-nao-do.hd-robot-bay-dong-tac'));
      if (s === 2) say(word('mot-ngay-nao-do.hd-robot-nho-giup'));
    }
    function reset() { arm = { l: [0.16, 0.28], r: [0.16, 0.28] }; shift = 0; pk = { gy: REST, ry: REST, held: false, hold: 0, done: false, v: 0, msgT: 0 }; rec = null; play = null; aim = null; hailed = false; quiet = 0; bub = null; stay = 0; setStage(0); }
    var job = animate(c, draw);
    reset();

    // input: one pointer path for mouse, pen and touch; touches only stop the page from scrolling when they land on a handle
    function local(cx, cy) { var r = c.getBoundingClientRect(); return geo ? [(cx - r.left - geo.ox) / geo.u, (cy - r.top - geo.oy) / geo.u] : [0, 0]; }
    function hit(p) {
      if (!geo) return null; var rad = Math.max(18 / geo.u, 7);
      if (stage === 2 && !pk.done && p[0] > X0 + PL * 0.45 && p[0] < geo.rx + rad && Math.abs(p[1] - (pk.gy + (pk.ry - pk.gy) * (p[0] - X0) / (geo.rx - X0))) < rad) return 'plank';
      if ((stage === 1 || stage === 3) && !phase && Math.hypot(p[0] - geo.rw[0], p[1] - geo.rw[1]) < rad) return 'hand';
      return null;
    }
    function start(what, p) {
      quiet = 0;
      if (what === 'hand') { grab = 'hand'; rec = { pts: [], t0: job.t }; aim = p; say(word('mot-ngay-nao-do.hd-robot-dang-ghi')); }
      if (what === 'plank') { grab = 'plank'; pk.held = true; aim = p; }
    }
    function release() {
      if (grab === 'hand') {
        var pts = rec.pts, dur = pts.length ? pts[pts.length - 1].t : 0, len = 0;
        for (var i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        if (dur < 0.6 || len < 14) { rec = null; say(word('mot-ngay-nao-do.hd-robot-ngan-qua')); }
        else { phase = 'think'; phaseT = 0; say(word('mot-ngay-nao-do.hd-robot-thu')); }
      }
      if (grab === 'plank') { pk.held = false; if (!pk.done) say(word('mot-ngay-nao-do.hd-robot-tuot-tay')); }
      grab = null; aim = null;
    }
    c.addEventListener('touchstart', function (e) { var t = e.touches[0]; if (t && hit(local(t.clientX, t.clientY))) e.preventDefault(); }, { passive: false });
    c.addEventListener('pointerdown', function (e) {
      var p = local(e.clientX, e.clientY), h = hit(p);
      if (stage === 0) stay = Math.max(stay, 1.2);
      if (h) { c.setPointerCapture(e.pointerId); start(h, p); e.preventDefault(); }
    });
    c.addEventListener('pointermove', function (e) { if (grab) aim = local(e.clientX, e.clientY); });
    c.addEventListener('pointerup', release); c.addEventListener('pointercancel', release);
    c.addEventListener('focus', function () { focused = true; }); c.addEventListener('blur', function () { focused = false; if (grab) release(); });
    c.addEventListener('keydown', function (e) {
      var k = e.key, dx = k === 'ArrowLeft' ? -3 : k === 'ArrowRight' ? 3 : 0, dy = k === 'ArrowUp' ? -3 : k === 'ArrowDown' ? 3 : 0;
      if (dx || dy) {
        e.preventDefault();
        if (!grab && geo) { if (stage === 2 && !pk.done) start('plank', [geo.rx, pk.ry]); else if ((stage === 1 || stage === 3) && !phase) start('hand', geo.rw.slice()); }
        if (aim) aim = [aim[0] + dx, aim[1] + dy];
      }
      if ((k === 'Enter' || k === ' ' || k === 'Escape') && grab) { e.preventDefault(); release(); }
    });
    document.getElementById('hu-reset').addEventListener('click', function () { reset(); c.focus(); });
    if (reduce) { // nothing moves on its own; input wakes the scene for a few seconds
      var until = 0, last = 0;
      var loop = function (now) { var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; job.t += dt; draw(dt, job.t); if (now < until || grab) requestAnimationFrame(loop); else last = 0; };
      ['pointerdown', 'pointermove', 'keydown', 'focus'].forEach(function (ev) { c.addEventListener(ev, function () { var idle = performance.now() > until; until = performance.now() + 4000; if (idle) requestAnimationFrame(loop); }); });
    }

    function draw(dt, t) {
      var f = fit(c), ctx = f.ctx, w = f.w, h = f.h; if (!w) return;
      var u = h / 110, ox = w * (0.5 - 0.15 * smooth(shift)), oy = h * 0.05;
      function P(x, y) { return [ox + x * u, oy + y * u]; }
      phaseT += dt; quiet += dt;
      var free = stage === 0 || (stage === 3 && !grab && !phase);
      stay = ptr.in || focused ? stay + dt : 0;

      // ---- story ----
      if (stage === 0) {
        if (!hailed && t > 0.8) { hailed = true; say(word('mot-ngay-nao-do.hd-robot-goi')); }
        if (stay > 1.2 && !phase) { phase = 'hi'; phaseT = 0; say(word('mot-ngay-nao-do.hd-robot-chao')); }
        if (phase === 'hi' && phaseT > 2.6) setStage(1);
      }
      if ((stage === 1 || stage === 3) && phase === 'think' && phaseT > 1.1) { phase = 'replay'; phaseT = 0; play = 0; say(word('mot-ngay-nao-do.hd-robot-the-nay-a')); }
      if (phase === 'replay') {
        play += dt; var dur = rec.pts[rec.pts.length - 1].t;
        if (play > dur + 0.5) { phase = 'learned'; phaseT = 0; say(word('mot-ngay-nao-do.hd-robot-hieu-roi')); if (stage === 1) quest[1].className = 'done'; }
      }
      if (phase === 'learned' && phaseT > 3) { rec = null; if (stage === 1) setStage(2); else phase = ''; }
      if (stage === 1 && !grab && !phase && quiet > 9) { quiet = 0; bub = null; say(word('mot-ngay-nao-do.hd-robot-nhac-lai')); }
      if (stage >= 2) shift = Math.min(1, shift + dt * 0.8);

      // ---- arms ----
      var la1 = 0.16 + Math.sin(t * 1.3) * 0.04, rest = [la1, la1 + 0.12], restR = [0.16 + Math.sin(t * 1.3 + 1) * 0.04, 0.28 + Math.sin(t * 1.3 + 1) * 0.04];
      wv += ((free && stay > 1.2 ? 1 : 0) - wv) * Math.min(1, dt * 3);
      var tl = rest, tr = [restR[0] * (1 - wv) + 2.25 * wv, restR[1] * (1 - wv) + (2.75 + Math.sin(t * 7) * 0.35) * wv], kArm = Math.min(1, dt * 6);
      if (grab === 'hand' && aim) {
        tr = ik(1, aim[0], aim[1]); kArm = Math.min(1, dt * 16);
        var wr = wrist(1, arm.r), el = t - rec.t0; rec.pts.push({ t: el, x: wr[0], y: wr[1] });
        say(word('mot-ngay-nao-do.hd-robot-dang-ghi') + ' ' + el.toFixed(1) + ' s', true);
        if (el > 6) release();
      }
      if (phase === 'replay') { var pts = rec.pts, i = 0; while (i < pts.length - 1 && pts[i + 1].t < play) i++; tl = ik(-1, -pts[i].x, pts[i].y); kArm = Math.min(1, dt * 16); }
      if (stage === 2 || (stage === 3 && pk.done && shift < 1)) {
        if (!pk.done) {
          var ry0 = pk.ry;
          if (pk.held && aim) pk.ry += (Math.max(26, Math.min(REST, aim[1])) - pk.ry) * Math.min(1, dt * 18); else pk.ry += (REST - pk.ry) * Math.min(1, dt * 5);
          pk.v = dt ? (pk.ry - ry0) / dt : 0;
          pk.gy += (pk.ry - pk.gy) * Math.min(1, dt * 2.4); pk.gy = Math.max(30, Math.min(REST, pk.gy));
          var near = Math.abs(pk.ry - GOAL) < 3.5 && Math.abs(pk.gy - GOAL) < 3.5;
          pk.hold = near && pk.held ? pk.hold + dt : Math.max(0, pk.hold - dt * 2);
          pk.msgT -= dt;
          if (pk.held && pk.msgT <= 0) {
            pk.msgT = 1.1;
            if (Math.abs(pk.v) > 70) say(word('mot-ngay-nao-do.hd-robot-tu-tu'));
            else if (near) say(word('mot-ngay-nao-do.hd-robot-giu'));
            else if (pk.ry > GOAL) say(word('mot-ngay-nao-do.hd-robot-len-chut'));
            else say(word('mot-ngay-nao-do.hd-robot-cao-qua'));
          }
          if (pk.hold > 1.1) { pk.done = true; pk.ry = pk.gy = GOAL; pk.held = false; grab = null; aim = null; quest[2].className = 'done'; say(word('mot-ngay-nao-do.hd-robot-xong')); stage = 3; phase = ''; qend.classList.add('on'); }
        }
        if (!pk.done) { tl = ik(-1, 0, pk.gy); tr = ik(1, 10, pk.gy); kArm = Math.min(1, dt * 10); }
      }
      ease(arm.l, tl, kArm); ease(arm.r, tr, kArm);

      // ---- skeleton ----
      var tgtLook = grab === 'hand' && aim ? Math.max(-1, Math.min(1, aim[0] / 30)) : phase === 'replay' ? -0.8 : grab === 'plank' ? 1 : ptr.in ? Math.max(-1, Math.min(1, (ptr.x - ox) / (w * 0.4))) : Math.sin(t * 0.4) * 0.3;
      look += (tgtLook - look) * Math.min(1, dt * 4);
      var J = {}; J.lS = P(-14, 30); J.rS = P(14, 30);
      J.lE = [J.lS[0] - Math.sin(arm.l[0]) * L1 * u, J.lS[1] + Math.cos(arm.l[0]) * L1 * u]; J.lW = [J.lE[0] - Math.sin(arm.l[1]) * L2 * u, J.lE[1] + Math.cos(arm.l[1]) * L2 * u];
      J.rE = [J.rS[0] + Math.sin(arm.r[0]) * L1 * u, J.rS[1] + Math.cos(arm.r[0]) * L1 * u]; J.rW = [J.rE[0] + Math.sin(arm.r[1]) * L2 * u, J.rE[1] + Math.cos(arm.r[1]) * L2 * u];
      J.lH = P(-7, 58); J.rH = P(7, 58); J.lK = P(-8, 78); J.rK = P(8, 78); J.lA = P(-8, 97); J.rA = P(8, 97);
      var head = P(look * 2.4, 15), neck = P(0, 24), chest = P(0, 30), pelvis = P(0, 56);
      var rx = X0 + Math.sqrt(PL * PL - Math.pow(Math.max(-PL * 0.7, Math.min(PL * 0.7, pk.ry - pk.gy)), 2));
      geo = { ox: ox, oy: oy, u: u, rx: rx, rw: [(J.rW[0] - ox) / u, (J.rW[1] - oy) / u] };

      ctx.strokeStyle = C['ink-2']; ctx.lineWidth = 1; var gy = J.lA[1] + 3 * u, gx0 = Math.min(ox - 30 * u, 6), gx1 = stage >= 2 ? Math.min(w - 6, P(X0 + PL + 14, 0)[0]) : ox + 30 * u;
      ctx.beginPath(); ctx.moveTo(gx0, gy); ctx.lineTo(gx1, gy); for (var g = gx0; g < gx1; g += 5 * u) { ctx.moveTo(g, gy); ctx.lineTo(g - 3 * u, gy + 3.5 * u); } ctx.stroke();

      // plank stage: trestle, the phantom shelf it belongs on, and the plank itself
      var pa = stage >= 2 ? Math.min(1, shift * 1.6) : 0;
      if (pa) {
        ctx.globalAlpha = pa;
        var tx = P(X0 + PL - 2, REST + 1.5);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(tx[0] - 6 * u, gy); ctx.lineTo(tx[0], tx[1]); ctx.lineTo(tx[0] + 6 * u, gy); ctx.moveTo(tx[0] - 4 * u, tx[1]); ctx.lineTo(tx[0] + 4 * u, tx[1]); ctx.stroke();
        var s0 = P(X0, GOAL + 1.5), s1 = P(X0 + PL, GOAL + 1.5);
        ctx.strokeStyle = C.pen; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
        if (!pk.done) { ctx.strokeRect(s0[0], s0[1] - 3 * u, s1[0] - s0[0], 3 * u); }
        ctx.beginPath(); ctx.moveTo(s0[0] - 2 * u, s0[1]); ctx.lineTo(s1[0] + 2 * u, s1[1]); [X0 + 6, X0 + PL - 6].forEach(function (bx) { var b = P(bx, GOAL + 1.5); ctx.moveTo(b[0], b[1]); ctx.lineTo(b[0], b[1] + 5 * u); ctx.lineTo(b[0] + 4 * u, b[1]); }); ctx.stroke(); ctx.setLineDash([]);
        if (!pk.done) { ctx.font = '600 10px "Reddit Mono Variable", "Reddit Mono", monospace'; ctx.fillStyle = C.pen; ctx.fillText(word('mot-ngay-nao-do.hd-nhan-ke'), s0[0] + 2 * u, s0[1] - 3 * u - 6); }
        ctx.globalAlpha = 1;
      }

      ctx.setLineDash([9, 3, 2, 3]); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
      function line(a, b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(head[0], head[1], 9 * u, 0, 7); ctx.stroke();
      line(neck, chest);
      var t1 = P(-14, 28), t2 = P(14, 28), t3 = P(10, 54), t4 = P(-10, 54);
      ctx.beginPath(); ctx.moveTo(t1[0], t1[1]); ctx.lineTo(t2[0], t2[1]); ctx.lineTo(t3[0], t3[1]); ctx.lineTo(t4[0], t4[1]); ctx.closePath(); ctx.stroke();
      line(J.lS, J.lE); line(J.lE, J.lW); line(J.rS, J.rE); line(J.rE, J.rW); line(P(-10, 56), P(10, 56));
      line(J.lH, J.lK); line(J.lK, J.lA); line(J.rH, J.rK); line(J.rK, J.rA);
      line(J.lA, [J.lA[0] - 6 * u, J.lA[1]]); line(J.rA, [J.rA[0] + 6 * u, J.rA[1]]);
      ctx.setLineDash([]);
      ctx.strokeStyle = C.pen; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(head[0] - 5 * u + look * 2.5 * u, head[1] - 1.5 * u); ctx.lineTo(head[0] + 5 * u + look * 2.5 * u, head[1] - 1.5 * u); ctx.stroke();

      if (pa) { // the plank, drawn in front of the body
        var a0 = P(X0, pk.gy), a1 = P(rx, pk.ry), ang = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]), len = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]);
        ctx.save(); ctx.globalAlpha = pa; ctx.translate(a0[0], a0[1]); ctx.rotate(ang);
        ctx.fillStyle = C.sheet; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.fillRect(0, -1.5 * u, len, 3 * u); ctx.strokeRect(0, -1.5 * u, len, 3 * u);
        ctx.strokeStyle = C['ink-2']; ctx.lineWidth = 0.7; ctx.beginPath(); for (var gx = 6 * u; gx < len - 2 * u; gx += 7 * u) { ctx.moveTo(gx, -1.5 * u); ctx.quadraticCurveTo(gx + 2 * u, 0, gx, 1.5 * u); } ctx.stroke();
        ctx.restore(); ctx.globalAlpha = 1;
        if (!pk.done) {
          var deg = Math.atan2(pk.ry - pk.gy, rx - X0) * 180 / Math.PI, mid = P((X0 + rx) / 2 + 6, (pk.gy + pk.ry) / 2 + 3.5);
          ctx.font = MONO; ctx.fillStyle = Math.abs(deg) < 3 ? C.accent : C['ink-2']; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText((word('mot-ngay-nao-do.hd-nghieng') + ' ') + (deg > 0 ? '+' : '') + deg.toFixed(1) + '°', mid[0], mid[1]); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
          if (!pk.held) ring(a1, t);
          if (pk.hold > 0) { ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(a1[0], a1[1], 11, -Math.PI / 2, -Math.PI / 2 + Math.min(1, pk.hold / 1.1) * Math.PI * 2); ctx.stroke(); }
        }
      }
      function ring(p, t) { var r = 9 + (Math.sin(t * 4) + 1) * 2.5; ctx.strokeStyle = C.pen; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.stroke(); }

      // the move being taught (pencil) and its mirror being tried (red)
      if (rec && rec.pts.length > 1) {
        var fade = phase === 'learned' ? Math.max(0, 1 - phaseT / 3) : 1;
        ctx.globalAlpha = fade * 0.8; ctx.strokeStyle = C.pencil; ctx.lineWidth = 1.3; ctx.setLineDash([2, 3]); ctx.beginPath();
        rec.pts.forEach(function (q, i) { var s = P(q.x, q.y); i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.stroke();
        if (phase === 'replay' || phase === 'learned') {
          ctx.strokeStyle = C.pen; ctx.setLineDash([]); ctx.lineWidth = 1.6; ctx.beginPath(); var lim = phase === 'replay' ? play : 1e9;
          rec.pts.forEach(function (q, i) { if (q.t > lim) return; var s = P(-q.x, q.y); i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.stroke();
        }
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
      if ((stage === 1 || stage === 3) && !grab && !phase && !(stage === 3 && wv > 0.3)) {
        ring(J.rW, t);
        if (stage === 1) { ctx.font = '19px ' + HAND; ctx.fillStyle = C.pen; ctx.fillText(word('mot-ngay-nao-do.hd-nam-day'), J.rW[0] + 14, J.rW[1] + 18); }
      }

      // neurons fire faster while it is thinking
      var thinking = phase === 'think';
      nextFire -= dt * (thinking ? 6 : ptr.in ? 2 : 1);
      if (nextFire <= 0 && dt) { nextFire = 0.35 + Math.random() * 0.4; net = 1; pulses.push({ j: JOINTS[(Math.random() * JOINTS.length) | 0], p: 0 }); }
      net = Math.max(0, net - dt * 2.2);
      var layers = [[-5, [-1, 2.5, 6]], [0, [-0.5, 2, 4.5, 7]], [5, [1, 5]]], nodes = layers.map(function (L) { return L[1].map(function (y) { return [head[0] + L[0] * u, head[1] + y * u * 0.75]; }); });
      ctx.lineWidth = 0.8; ctx.strokeStyle = C.accent; ctx.globalAlpha = 0.25 + net * 0.6; ctx.beginPath();
      for (var a = 0; a < 2; a++) nodes[a].forEach(function (p) { nodes[a + 1].forEach(function (q) { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); });
      ctx.stroke(); ctx.globalAlpha = 1;
      nodes.forEach(function (L) { L.forEach(function (p) { ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(p[0], p[1], 1.4 + net * 0.8, 0, 7); ctx.fill(); }); });
      function route(j) { var isArm = 'SEW'.indexOf(j[1]) >= 0, r = [neck, isArm ? chest : pelvis], ch = isArm ? 'SEW' : 'HKA'; for (var i = 0; i < 3; i++) { r.push(J[j[0] + ch[i]]); if (ch[i] === j[1]) break; } return r; }
      pulses = pulses.filter(function (pl) { pl.p += dt * 1.6; if (pl.p >= 1) { glow[pl.j] = 1; return false; } var q = along(route(pl.j), pl.p); ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(q[0], q[1], 2.4, 0, 7); ctx.fill(); return true; });
      JOINTS.forEach(function (j) {
        var gl = glow[j] || 0; glow[j] = Math.max(0, gl - dt * 1.5);
        ctx.fillStyle = C.sheet; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(J[j][0], J[j][1], 2.9, 0, 7); ctx.fill(); ctx.stroke();
        if (gl > 0) { ctx.globalAlpha = gl; ctx.fillStyle = C.accent; ctx.strokeStyle = C.accent; ctx.beginPath(); ctx.arc(J[j][0], J[j][1], 2.9, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(J[j][0], J[j][1], 2.9 + (1 - gl) * 9, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
      });

      // speech: typed out, wrapped, tail pointing at the head
      if (bub) {
        var txt = bub.txt, shown = bub.live || reduce ? txt : txt.slice(0, Math.floor((t - bub.at) * 32)), fs = Math.max(16, Math.min(21, w / 26));
        ctx.font = fs + 'px ' + HAND;
        var bx = head[0] + 13 * u, by = Math.max(6, head[1] - 22 * u), maxW = Math.min(w - bx - 10, w * 0.44), words = txt.split(' '), lines = [''], k2 = 0;
        if (maxW < 110) { bx = Math.max(8, w - 10 - Math.min(w * 0.44, 200)); maxW = w - bx - 10; }
        words.forEach(function (wd) { var tryL = lines[lines.length - 1] ? lines[lines.length - 1] + ' ' + wd : wd; if (ctx.measureText(tryL).width > maxW - 16 && lines[lines.length - 1]) lines.push(wd); else lines[lines.length - 1] = tryL; });
        var bw = Math.max.apply(null, lines.map(function (l) { return ctx.measureText(l).width; })) + 16, lh = fs * 1.1, bh = lines.length * lh + 10;
        ctx.fillStyle = C.sheet; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + 10, by + bh); ctx.lineTo(head[0] + 7 * u, head[1] - 5 * u); ctx.lineTo(bx + 22, by + bh); ctx.fillStyle = C.sheet; ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.sheet; ctx.fillRect(bx + 11, by + bh - 1.5, 10, 3);
        ctx.fillStyle = C.ink; ctx.textBaseline = 'top';
        lines.forEach(function (l, li) { var n = Math.max(0, Math.min(l.length, shown.length - k2)); ctx.fillText(l.slice(0, n), bx + 8, by + 6 + li * lh); k2 += l.length + 1; });
        ctx.textBaseline = 'alphabetic';
      }
      c.style.cursor = grab ? 'grabbing' : ptr.in && hit([(ptr.x - ox) / u, (ptr.y - oy) / u]) ? 'grab' : '';
      ctx.font = MONO; ctx.fillStyle = C['ink-2']; ctx.fillText('PA-HX · REV ?', 10, h - 11);
    }
  })();

  /* ---------- together: the visitor aligns the pins; once mated, signals run both ways and the 2022 error shrinks ---------- */
  (function () {
    var m = document.getElementById('mail'); m.href = 'mailto:' + ['trinhbuikhang060708', 'gmail.com'].join('@');
    var c = document.getElementById('mate'), table = document.getElementById('pinout'), rows = [].slice.call(table.querySelectorAll('tbody tr'));
    var mis, mated, matedAt, touched, drag = null, moved = 0, timers = [], buf = [], acc = 0, level = 1, SP = 20;
    function sm(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    function light(on) {
      timers.forEach(clearTimeout); timers = [];
      table.classList.toggle('mated', on);
      rows.forEach(function (r, i) { if (!on) r.classList.remove('lit'); else timers.push(setTimeout(function () { r.classList.add('lit'); }, reduce ? 0 : 500 + i * 220)); });
    }
    function reset() { mis = (Math.random() < 0.5 ? -1 : 1) * 0.62; mated = false; touched = false; job.t = 0; light(false); }
    function mate(t) { if (mated) return; mated = true; matedAt = t; light(true); }
    var job = animate(c, draw);
    reset();
    if (reduce) { mis = 0; mate(0); }
    function nudge(d) { if (mated) return; touched = true; mis = Math.max(-0.9, Math.min(0.9, mis + d)); if (Math.abs(mis) < 0.09) { mis = 0; mate(job.t); } if (reduce) draw(0, job.t); }
    c.addEventListener('pointerdown', function (e) { drag = e.clientY; moved = 0; c.setPointerCapture(e.pointerId); c.style.cursor = 'grabbing'; });
    c.addEventListener('pointermove', function (e) { if (drag === null) return; var d = e.clientY - drag; drag = e.clientY; moved += Math.abs(d); nudge(d / SP); });
    function up() { if (drag === null) return; drag = null; c.style.cursor = ''; if (moved < 3 && mated && job.t - matedAt > 1) { reset(); if (reduce) { mis = 0; mate(0); draw(0, 0); } } }
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    c.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); nudge(e.key === 'ArrowUp' ? -0.08 : 0.08); }
      if ((e.key === 'Enter' || e.key === ' ') && mated) { e.preventDefault(); reset(); }
    });
    function draw(dt, t) {
      var f = fit(c), x = f.ctx, w = f.w, h = f.h; if (!w) return;
      var top = h * 0.66, cy = top * 0.54;
      var bw = Math.min(w * 0.25, 170), bh = Math.min(top * 0.56, 130), pl = w * 0.06, sp = bh / 6; SP = sp;
      // patience also works: after a long wait the plug finds its own way
      if (!mated && !reduce && t > 16 && !touched) { mis *= Math.pow(0.3, dt); if (Math.abs(mis) < 0.09) { mis = 0; mate(t); } }
      var k = mated ? t - matedAt : -1, ins = sm(k / 0.4);
      var gap = mated ? 8 - (8 + pl * 0.8) * ins : 140 * (1 - sm(t / 1.4)) + 8 + (t > 1.4 ? 3 * Math.abs(Math.sin(t * 3)) : 0);
      var off = mis * sp;
      var left = (w - (2 * bw + pl + gap)) / 2, xL = left + bw, xR = xL + pl + gap;
      x.lineCap = 'round'; x.lineJoin = 'round';
      // cables, two lanes each side
      x.strokeStyle = C.ink; x.lineWidth = 1.4;
      [-6, 6].forEach(function (o) {
        x.beginPath(); x.moveTo(0, cy + o); x.bezierCurveTo(left * 0.5, cy + o, left * 0.5, cy + o + off, left, cy + o + off); x.stroke();
        x.beginPath(); x.moveTo(xR + bw, cy + o); x.lineTo(w, cy + o); x.stroke();
      });
      if (mated && k > 0.4) {
        var q = k - 0.4;
        for (var i = 0; i < 4; i++) {
          var p = (q * 0.32 + i / 4) % 1, px = p * w, qx = w - px;
          x.globalAlpha = Math.min(1, q * 2);
          x.fillStyle = C.pen; if (px < left || px > xR + bw) { x.beginPath(); x.arc(px, cy - 6, 3.4, 0, 7); x.fill(); }
          x.fillStyle = C.accent; if (qx < left || qx > xR + bw) { x.beginPath(); x.arc(qx, cy + 6, 3.4, 0, 7); x.fill(); }
        }
        x.globalAlpha = 1;
      }
      // pins, plug (you), socket (me) drawn over the pins so they vanish inside
      x.fillStyle = C.ink;
      for (var j = 0; j < 5; j++) x.fillRect(xL, cy + (j - 2) * sp + off - 2, pl, 4);
      x.fillStyle = C.sheet; x.strokeStyle = drag !== null ? C.accent : C.ink; x.lineWidth = 1.8;
      x.fillRect(left, cy - bh / 2 + off, bw, bh); x.strokeRect(left, cy - bh / 2 + off, bw, bh);
      x.lineWidth = 1; x.beginPath(); x.moveTo(left + bw * 0.18, cy - bh / 2 + off); x.lineTo(left + bw * 0.18, cy + bh / 2 + off); x.stroke();
      if (!mated) { // grip ridges: this is the part you can move
        x.strokeStyle = C['ink-2']; x.beginPath();
        for (j = -2; j <= 2; j++) { x.moveTo(left + bw * 0.06, cy + off + j * 6); x.lineTo(left + bw * 0.12, cy + off + j * 6); }
        x.stroke();
      }
      x.strokeStyle = C.ink; x.lineWidth = 1.8; x.fillStyle = C.sheet;
      x.fillRect(xR, cy - bh / 2 - 6, bw, bh + 12); x.strokeRect(xR, cy - bh / 2 - 6, bw, bh + 12);
      x.fillStyle = C.ink;
      for (j = 0; j < 5; j++) x.fillRect(xR - 1, cy + (j - 2) * sp - 3, 4, 6);
      x.textAlign = 'center'; x.fillStyle = C.ink; x.font = '700 13px "Archivo Variable", "Archivo", sans-serif';
      x.fillText(word('cung-lam.hd-ban'), left + bw * 0.59, cy - 4 + off); x.fillText('KHANG', xR + bw / 2, cy - 4);
      x.font = MONO; x.fillStyle = C['ink-2'];
      x.fillText(word('cung-lam.hd-van-de'), left + bw * 0.59, cy + 14 + off); x.fillText(word('cung-lam.hd-cong-cu'), xR + bw / 2, cy + 14);
      var mid = xL + pl / 2;
      if (!mated && t > 1.4) {
        x.save(); x.translate(mid, cy - bh / 2 - 16); x.rotate(Math.sin(t * 6) * 0.15);
        x.font = '24px ' + HAND; x.fillStyle = C.pen; x.fillText('?', -10, 0); x.fillText('?', 12, 6); x.restore();
        if (!touched) { // hint arrow on the plug
          var a = 0.55 + 0.45 * Math.sin(t * 3);
          x.globalAlpha = a; x.strokeStyle = C.pen; x.fillStyle = C.pen; x.lineWidth = 1.6;
          var hx = left - 16, hy = cy + off;
          x.beginPath(); x.moveTo(hx, hy - 22); x.lineTo(hx, hy + 22); x.moveTo(hx - 5, hy - 16); x.lineTo(hx, hy - 22); x.lineTo(hx + 5, hy - 16); x.moveTo(hx - 5, hy + 16); x.lineTo(hx, hy + 22); x.lineTo(hx + 5, hy + 16); x.stroke();
          x.font = '19px ' + HAND; x.textAlign = 'left'; x.fillText(word('cung-lam.hd-keo-toi'), Math.max(4, left - 8), cy - bh / 2 + off - 10);
          x.globalAlpha = 1;
        }
      }
      if (mated) {
        var s2 = sm((k - 0.4) / 0.3);
        x.save(); x.translate(mid, cy - bh / 2 - 26); x.rotate(-0.08); x.globalAlpha = s2 * 0.9;
        x.font = '700 12px "Reddit Mono Variable", "Reddit Mono", monospace'; var lab = word('cung-lam.hd-da-khop'), tw = x.measureText(lab).width;
        x.strokeStyle = C.pen; x.lineWidth = 2; x.strokeRect(-tw / 2 - 7, -13, tw + 14, 21); x.fillStyle = C.pen; x.textAlign = 'center'; x.fillText(lab, 0, 2);
        x.restore();
      }
      // scope strip: the error signal from 2022 keeps running here
      var sT = top + 10, sB = h - 22, z = (sT + sB) / 2 + 4, A = (sB - sT) * 0.42, L = 26, R = w - 8;
      x.strokeStyle = C.rule; x.lineWidth = 1; x.beginPath(); x.moveTo(0, top); x.lineTo(w, top); x.stroke();
      x.setLineDash([2, 4]); x.strokeStyle = C['ink-2']; x.beginPath(); x.moveTo(L, z); x.lineTo(R, z); x.stroke(); x.setLineDash([]);
      x.font = MONO; x.fillStyle = C['ink-2']; x.textAlign = 'right'; x.fillText('e', L - 8, sT + 10); x.fillText('0', L - 8, z + 4);
      x.textAlign = 'left'; x.fillText(word('cung-lam.hd-tu-2022'), L, sB + 16);
      var n = Math.max(2, Math.floor((R - L) / 3));
      level += ((mated ? 0.38 : 1) - level) * Math.min(1, dt * 1.2);
      if (reduce || buf.length !== n) { buf = []; for (j = 0; j < n; j++) buf.push(sample(j * 0.05, mated ? 0.38 : 1)); level = mated ? 0.38 : 1; }
      acc += dt; while (acc > 0.05) { acc -= 0.05; buf.shift(); buf.push(sample(t, level)); }
      x.strokeStyle = C.ink; x.lineWidth = 1.6; x.beginPath();
      for (j = 0; j < n; j++) { var px2 = L + j / (n - 1) * (R - L), py = z - buf[j] * A; j ? x.lineTo(px2, py) : x.moveTo(px2, py); }
      x.stroke();
      x.fillStyle = C.accent; x.beginPath(); x.arc(R, z - buf[n - 1] * A, 3.2, 0, 7); x.fill();
      if (mated && k > 1.6) {
        x.globalAlpha = sm((k - 1.6) / 0.5); x.font = '19px ' + HAND; x.fillStyle = C.pen; x.textAlign = 'right';
        x.fillText(word('cung-lam.hd-nho-di'), R - 6, sT + 12); x.globalAlpha = 1;
      }
      x.textAlign = 'left';
    }
    function sample(t, lv) {
      return lv * (0.32 + 0.38 * Math.sin(t * 5.3) * Math.cos(t * 1.7) + 0.22 * Math.sin(t * 13.1 + Math.sin(t * 2.3)));
    }
  })();

  /* ---------- stories: scope captures ---------- */
  var CH = { 1: '#f2d21b', 2: '#25c4e6', 3: '#e64aa9' };
  var waves = {
    sine: function (x, t) { return Math.sin(x * 2.2 + t * 1.2) * 0.55; },
    square: function (x, t) { return (Math.sin(x * 1.6 + t * 1.6) > 0 ? 0.5 : -0.5) + Math.sin(x * 40) * 0.015; },
    damped: function (x, t) { var u = ((x + t * 0.8) % 6.28); return Math.exp(-u * 0.55) * Math.cos(u * 6) * 0.8; }
  };
  [].slice.call(document.querySelectorAll('.an')).forEach(function (a, idx) {
    var c = a.querySelector('canvas'), fn = waves[a.dataset.wave], col = CH[a.dataset.ch], hover = false, phase = 0, lock = reduce ? 1 : 0;
    a.addEventListener('pointerenter', function () { hover = true; }); a.addEventListener('pointerleave', function () { hover = false; });
    animate(c, function (dt, t) {
      var f = fit(c), ctx = f.ctx, w = f.w, h = f.h; if (!w) return;
      if (t > 0.5 + idx * 0.35) lock = Math.min(1, lock + dt * 1.4);
      ctx.strokeStyle = 'rgba(190,220,210,0.16)'; ctx.lineWidth = 1; ctx.setLineDash([1, 3]); ctx.beginPath();
      for (var i = 1; i < 10; i++) { ctx.moveTo(w * i / 10, 0); ctx.lineTo(w * i / 10, h); }
      for (var j = 1; j < 8; j++) { ctx.moveTo(0, h * j / 8); ctx.lineTo(w, h * j / 8); }
      ctx.stroke(); ctx.setLineDash([]);
      phase += dt * (hover ? 1.4 : 0.35);
      var e = lock * lock * (3 - 2 * lock), jit = (1 - e) * (Math.random() - 0.5) * 2.4;
      ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.shadowColor = col; ctx.shadowBlur = 4; ctx.beginPath();
      for (var x = 0; x <= w; x += 2) { var y = h / 2 - (fn(x / w * 6.28 + jit, phase) * e + (Math.random() - 0.5) * 0.35 * (1 - e)) * h / 2; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.font = MONO; ctx.fillStyle = col; ctx.fillText('CH' + a.dataset.ch, 8, h - 8);
      ctx.textAlign = 'right'; ctx.fillStyle = lock >= 1 ? '#7be0a0' : '#f2a33a'; ctx.fillText(lock >= 1 ? "TRIG'D" : 'AUTO…', w - 8, 16); ctx.textAlign = 'left';
    });
  });

  /* ---------- trace: timing diagram with a red-pen "you are here" ---------- */
  var tm = (TX['dau-vet.cac-moc'] || [[], []])[lang === 'en' ? 1 : 0].map(function (m) { var r = /^(\d{4})\s*[:·–-]?\s*(.*)$/.exec(m) || [0, 0, m]; return [+r[1], r[2]]; });
  var tsvg = document.getElementById('timing'), segs = [], TW = 900, futureX = 1e9;
  function drawTiming() {
    TW = tsvg.getBoundingClientRect().width || 900;
    var H = 150, top = 62, bh = 34, sl = 8, y0 = top, y1 = top + bh, mid = y0 + bh / 2, weights = [], tot = 0;
    tm.forEach(function (m, i) { var g = i < tm.length - 1 ? tm[i + 1][0] - m[0] : 2, w = 1 + Math.log2(g + 1); weights.push(w); tot += w; });
    tot += 1.6;
    var x = 0, out = '<defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="' + C.paper + '"/><line x1="0" y1="0" x2="0" y2="7" stroke="' + C['ink-2'] + '" stroke-width="1.2"/></pattern></defs>';
    segs = [];
    tm.forEach(function (m, i) {
      var w = weights[i] / tot * (TW - 2), xa = x + 1, xb = x + w + 1, cur = i === tm.length - 1, label = m[1];
      segs.push([xa, xb, m[0], i < tm.length - 1 ? tm[i + 1][0] : m[0] + 1]);
      out += '<path class="ln' + (cur ? ' cur' : '') + '" d="M' + xa + ' ' + mid + ' L' + (xa + sl) + ' ' + y0 + ' H' + (xb - sl) + ' L' + xb + ' ' + mid + ' L' + (xb - sl) + ' ' + y1 + ' H' + (xa + sl) + ' Z"/>';
      var inside = xb - xa - 2 * sl > label.length * 6.6;
      if (inside) out += '<text x="' + (xa + sl + 6) + '" y="' + (mid + 4.5) + '"' + (cur ? ' class="curt"' : '') + '>' + label + '</text>';
      else out += '<text x="' + (xa + sl) + '" y="' + (y1 + 34) + '">' + label + '</text><line class="tick" x1="' + (xa + sl + 4) + '" x2="' + (xa + sl + 4) + '" y1="' + y1 + '" y2="' + (y1 + 22) + '"/>';
      out += '<text class="yr" x="' + xa + '" y="' + (!inside || i % 2 ? y0 - 8 : y1 + 16) + '">' + m[0] + '</text>';
      if (cur) { var hx = (xa + xb) / 2, fl = hx + 180 > TW ? -1 : 1; out += '<path class="herel" d="M' + (hx + fl * 34) + ' ' + (y0 - 46) + ' C' + (hx + fl * 10) + ' ' + (y0 - 40) + ' ' + hx + ' ' + (y0 - 30) + ' ' + hx + ' ' + (y0 - 6) + ' M' + (hx - 5) + ' ' + (y0 - 13) + ' L' + hx + ' ' + (y0 - 5) + ' L' + (hx + 6) + ' ' + (y0 - 12) + '"/><text class="here" x="' + (hx + fl * 38) + '" y="' + (y0 - 42) + '"' + (fl < 0 ? ' text-anchor="end"' : '') + '>' + (word('dau-vet.hd-dang-o-day')) + '</text>'; }
      x += w;
    });
    var fa = x + 1, fb = TW - 1; futureX = fa;
    out += '<path class="x" d="M' + fa + ' ' + mid + ' L' + (fa + sl) + ' ' + y0 + ' H' + fb + ' V' + y1 + ' H' + (fa + sl) + ' Z"/>';
    out += '<path class="ln" d="M' + fa + ' ' + mid + ' L' + (fa + sl) + ' ' + y0 + ' H' + fb + ' M' + fa + ' ' + mid + ' L' + (fa + sl) + ' ' + y1 + ' H' + fb + '"/>';
    out += '<text class="yr" x="' + fb + '" y="' + (y1 + 16) + '" text-anchor="end">?</text>';
    out += '<g class="cursor" id="cursor" style="display:none"><line y1="' + (top - 4) + '" y2="' + (y1 + 4) + '"/><rect y="' + (y1 + 6) + '" height="16" width="60" rx="1"/><text y="' + (y1 + 18) + '"></text></g>';
    tsvg.setAttribute('viewBox', '0 0 ' + TW + ' ' + H); tsvg.innerHTML = out;
  }
  drawTiming(); new ResizeObserver(drawTiming).observe(tsvg.parentNode);
  tsvg.addEventListener('pointermove', function (e) {
    var cur = document.getElementById('cursor'), r = tsvg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * TW, label = '?';
    segs.forEach(function (s) { if (x >= s[0] && x < s[1]) label = '≈ ' + Math.floor(s[2] + (x - s[0]) / (s[1] - s[0]) * (s[3] - s[2])); });
    if (x >= futureX) label = word('dau-vet.hd-tuong-lai');
    cur.style.display = ''; var ln = cur.querySelector('line'), rc = cur.querySelector('rect'), tx = cur.querySelector('text');
    ln.setAttribute('x1', x); ln.setAttribute('x2', x);
    var rw = label.length * 7 + 12, rx = Math.min(Math.max(x - rw / 2, 0), TW - rw);
    rc.setAttribute('x', rx); rc.setAttribute('width', rw); tx.setAttribute('x', rx + 6); tx.textContent = label;
  });
  tsvg.addEventListener('pointerleave', function () { document.getElementById('cursor').style.display = 'none'; });
})();
