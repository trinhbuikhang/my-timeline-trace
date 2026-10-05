/**
 * Hero globe — orthographic projection drawn on canvas.
 * Land is a precomputed dot matrix (scripts/build-land-dots.mjs), so the
 * client ships no map library: just the math below.
 */
import landDots from '../data/land-dots.json';

export type Place = { id: string; name: string; lat: number; lon: number; label: string };

type Options = {
  canvas: HTMLCanvasElement;
  places: Place[];
  /** Called with the current view centre, throttled. */
  onCenter?: (lat: number, lon: number) => void;
  /** Called once the intro sweep is done. */
  onReady?: () => void;
  reducedMotion: boolean;
  animateIntro: boolean;
};

const RAD = Math.PI / 180;
const AUTO_SPEED = 2.4; // degrees per second
const ARC_LIFT = 0.18; // arc height relative to radius

// Precompute trig per land dot once.
const N = landDots.length / 2;
const dotSinLat = new Float32Array(N);
const dotCosLat = new Float32Array(N);
const dotLon = new Float32Array(N);
const dotReveal = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const lon = landDots[i * 2] / 10;
  const lat = landDots[i * 2 + 1] / 10;
  dotSinLat[i] = Math.sin(lat * RAD);
  dotCosLat[i] = Math.cos(lat * RAD);
  dotLon[i] = lon * RAD;
  // Intro sweeps north → south, with a little grain.
  dotReveal[i] = (90 - lat) / 180 * 0.85 + Math.random() * 0.15;
}

export const LAND_POINTS = N;

type Vec3 = [number, number, number];

const toVec = (lat: number, lon: number): Vec3 => {
  const cl = Math.cos(lat * RAD);
  return [cl * Math.cos(lon * RAD), cl * Math.sin(lon * RAD), Math.sin(lat * RAD)];
};

const fromVec = ([x, y, z]: Vec3): [number, number] => [Math.asin(Math.max(-1, Math.min(1, z))) / RAD, Math.atan2(y, x) / RAD];

/** Great-circle interpolation between two lat/lon points. */
function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return a;
  const s = Math.sin(omega);
  const ka = Math.sin((1 - t) * omega) / s;
  const kb = Math.sin(t * omega) / s;
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
}

export function createGlobe({ canvas, places, onCenter, onReady, reducedMotion, animateIntro }: Options) {
  const ctx = canvas.getContext('2d')!;
  const css = getComputedStyle(canvas);
  const color = {
    text: css.getPropertyValue('--text').trim() || '#ece9e2',
    signal: css.getPropertyValue('--signal').trim() || '#c9a46a',
    line: css.getPropertyValue('--line-strong').trim() || '#3a3833',
  };
  const monoFont = css.getPropertyValue('--font-mono').trim() || 'monospace';

  // Start centred between the places so the whole journey is in view.
  let centerLat = -12;
  let centerLon = 140;
  if (places.length) {
    const sum = places.map((p) => toVec(p.lat, p.lon)).reduce<Vec3>((s, v) => [s[0] + v[0], s[1] + v[1], s[2] + v[2]], [0, 0, 0]);
    const len = Math.hypot(...sum) || 1;
    [centerLat, centerLon] = fromVec([sum[0] / len, sum[1] / len, sum[2] / len]);
    centerLat = Math.max(-35, Math.min(35, centerLat));
  }

  let width = 0, height = 0, dpr = 1, R = 0, cx = 0, cy = 0;
  // Part of the canvas actually on screen (the globe may bleed off the edge).
  let visLeft = 0, visRight = 0;
  let running = false;
  let visible = true;
  let raf = 0;
  let last = 0;
  let clock = 0;
  let intro = animateIntro && !reducedMotion ? 0 : 1;
  let readyFired = false;

  // Drag state
  let dragging = false;
  let lastX = 0, lastY = 0;
  let velLon = 0, velLat = 0;
  let idleSince = -Infinity;

  const arcs = places.slice(1).map((p, i) => [toVec(places[i].lat, places[i].lon), toVec(p.lat, p.lon)] as const);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    R = Math.min(width, height) * 0.42;
    cx = width / 2;
    cy = height / 2;
    visLeft = Math.max(0, -rect.left) + 8;
    visRight = Math.min(width, document.documentElement.clientWidth - rect.left) - 8;
    draw();
  }

  /** Orthographic projection of a unit-sphere point lifted by k. */
  function project(lat: number, lon: number, k = 1) {
    const sφ = Math.sin(lat * RAD), cφ = Math.cos(lat * RAD);
    const sφ0 = Math.sin(centerLat * RAD), cφ0 = Math.cos(centerLat * RAD);
    const dλ = (lon - centerLon) * RAD;
    const x = cφ * Math.sin(dλ);
    const y = cφ0 * sφ - sφ0 * cφ * Math.cos(dλ);
    const z = sφ0 * sφ + cφ0 * cφ * Math.cos(dλ);
    const front = z > 0 || (x * x + y * y) * k * k > 1;
    return { x: cx + R * k * x, y: cy - R * k * y, z, front };
  }

  function drawGraticule() {
    ctx.strokeStyle = color.text;
    ctx.globalAlpha = 0.055;
    ctx.lineWidth = 0.6;
    const line = (pts: [number, number][]) => {
      ctx.beginPath();
      let pen = false;
      for (const [lat, lon] of pts) {
        const p = project(lat, lon);
        if (p.z > 0) {
          pen ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
          pen = true;
        } else pen = false;
      }
      ctx.stroke();
    };
    for (let lon = -180; lon < 180; lon += 15) {
      const pts: [number, number][] = [];
      for (let lat = -80; lat <= 80; lat += 4) pts.push([lat, lon]);
      line(pts);
    }
    for (let lat = -75; lat <= 75; lat += 15) {
      const pts: [number, number][] = [];
      for (let lon = -180; lon <= 180; lon += 4) pts.push([lat, lon]);
      line(pts);
    }
    ctx.globalAlpha = 1;
  }

  function drawLand() {
    const sφ0 = Math.sin(centerLat * RAD), cφ0 = Math.cos(centerLat * RAD);
    const λ0 = centerLon * RAD;
    // Four alpha buckets keep fillStyle changes to a minimum.
    const buckets: number[][] = [[], [], [], []];
    for (let i = 0; i < N; i++) {
      if (dotReveal[i] > intro) continue;
      const dλ = dotLon[i] - λ0;
      const cdλ = Math.cos(dλ);
      const z = sφ0 * dotSinLat[i] + cφ0 * dotCosLat[i] * cdλ;
      if (z <= 0.02) continue;
      const x = dotCosLat[i] * Math.sin(dλ);
      const y = cφ0 * dotSinLat[i] - sφ0 * dotCosLat[i] * cdλ;
      const b = z > 0.75 ? 3 : z > 0.45 ? 2 : z > 0.2 ? 1 : 0;
      buckets[b].push(cx + R * x, cy - R * y);
    }
    ctx.fillStyle = color.text;
    const alphas = [0.16, 0.3, 0.48, 0.66];
    const sizes = [0.9, 1.1, 1.35, 1.6];
    buckets.forEach((pts, b) => {
      ctx.globalAlpha = alphas[b];
      const s = sizes[b] * Math.max(R / 260, 0.75);
      for (let j = 0; j < pts.length; j += 2) ctx.fillRect(pts[j] - s / 2, pts[j + 1] - s / 2, s, s);
    });
    ctx.globalAlpha = 1;
  }

  function drawArcs() {
    if (intro < 1) return;
    const STEPS = 64;
    arcs.forEach(([a, b], idx) => {
      const pts = [];
      for (let s = 0; s <= STEPS; s++) {
        const t = s / STEPS;
        const [lat, lon] = fromVec(slerp(a, b, t));
        pts.push(project(lat, lon, 1 + ARC_LIFT * Math.sin(Math.PI * t)));
      }
      // Arc path
      ctx.strokeStyle = color.signal;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.lineDashOffset = reducedMotion ? 0 : -clock * 12;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      let pen = false;
      for (const p of pts) {
        if (p.front) { pen ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); pen = true; } else pen = false;
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // A pulse travelling the route, with a short tail.
      if (!reducedMotion) {
        const period = 4.5;
        const head = ((clock + idx * 1.3) % period) / period;
        for (let k = 0; k < 14; k++) {
          const t = head - k * 0.012;
          if (t < 0) break;
          const p = pts[Math.round(t * STEPS)];
          if (!p.front) continue;
          ctx.globalAlpha = (1 - k / 14) * 0.9;
          ctx.fillStyle = color.signal;
          const s = 2.2 - k * 0.12;
          ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1;
    });
  }

  function drawPlaces() {
    if (intro < 1) return;
    const fontSize = width < 520 ? 9.5 : 10.5;
    ctx.font = `500 ${fontSize}px ${monoFont}`;
    ctx.textBaseline = 'middle';
    places.forEach((place, i) => {
      const p = project(place.lat, place.lon);
      if (p.z <= 0.05) return;
      const fade = Math.min(1, (p.z - 0.05) / 0.25);

      // Pulse ring
      if (!reducedMotion) {
        const phase = ((clock + i * 0.8) % 2.6) / 2.6;
        ctx.strokeStyle = color.signal;
        ctx.globalAlpha = (1 - phase) * 0.6 * fade;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + phase * 16, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Marker: a small square, like a survey point
      ctx.globalAlpha = fade;
      ctx.fillStyle = color.signal;
      ctx.fillRect(p.x - 2.5, p.y - 2.5, 5, 5);

      // Leader line + label
      // Labels point outward, unless that would push them off screen.
      const room = 170;
      let dir = p.x > cx ? 1 : -1;
      if (dir > 0 && p.x + room > visRight) dir = -1;
      else if (dir < 0 && p.x - room < visLeft) dir = 1;
      const lx = p.x + dir * 22;
      const ly = p.y - 18;
      ctx.strokeStyle = color.signal;
      ctx.globalAlpha = 0.5 * fade;
      ctx.beginPath();
      ctx.moveTo(p.x + dir * 4, p.y - 4);
      ctx.lineTo(lx, ly);
      ctx.lineTo(lx + dir * 8, ly);
      ctx.stroke();

      ctx.textAlign = dir > 0 ? 'left' : 'right';
      ctx.globalAlpha = 0.95 * fade;
      ctx.fillStyle = color.text;
      ctx.fillText(place.name.toUpperCase(), lx + dir * 12, ly - 6);
      ctx.globalAlpha = 0.55 * fade;
      ctx.fillText(place.label, lx + dir * 12, ly + 7);
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  function drawSphere() {
    // Faint atmosphere
    const glow = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.25);
    glow.addColorStop(0, 'rgba(201,164,106,0.07)');
    glow.addColorStop(1, 'rgba(201,164,106,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // Body: light from upper left
    const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    body.addColorStop(0, '#171715');
    body.addColorStop(1, '#0b0b0a');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = color.line;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function draw() {
    if (!width) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = Math.min(1, intro * 2.5);
    drawSphere();
    ctx.globalAlpha = 1;
    drawGraticule();
    drawLand();
    drawArcs();
    drawPlaces();
  }

  let lastReport = 0;
  function frame(now: number) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    clock += dt;

    if (intro < 1) {
      intro = Math.min(1, intro + dt / 1.6);
      if (intro === 1 && !readyFired) { readyFired = true; onReady?.(); }
    }

    if (!dragging) {
      // Inertia, then gentle auto-rotation after a pause.
      if (Math.abs(velLon) > 0.01 || Math.abs(velLat) > 0.01) {
        centerLon += velLon;
        centerLat = Math.max(-60, Math.min(60, centerLat + velLat));
        velLon *= 0.93;
        velLat *= 0.93;
      } else if (!reducedMotion && now - idleSince > 2500) {
        centerLon += AUTO_SPEED * dt;
      }
    }
    centerLon = ((centerLon + 540) % 360) - 180;

    draw();

    if (onCenter && now - lastReport > 120) {
      lastReport = now;
      onCenter(centerLat, centerLon);
    }
    // With reduced motion, only render while the user is moving the globe.
    const settled = reducedMotion && !dragging && Math.abs(velLon) < 0.01 && Math.abs(velLat) < 0.01;
    if (settled) running = false;
    raf = running ? requestAnimationFrame(frame) : 0;
  }

  function start() {
    if (running || !visible) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  // Pointer interaction
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    velLon = velLat = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.dataset.dragging = '';
    start();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const k = 90 / R;
    velLon = -(e.clientX - lastX) * k;
    velLat = (e.clientY - lastY) * k;
    centerLon += velLon;
    centerLat = Math.max(-60, Math.min(60, centerLat + velLat));
    lastX = e.clientX;
    lastY = e.clientY;
    if (!running) draw();
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    idleSince = performance.now();
    delete canvas.dataset.dragging;
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  // Keyboard: arrows rotate
  canvas.addEventListener('keydown', (e) => {
    const step = 10;
    const moves: Record<string, [number, number]> = { ArrowLeft: [0, -step], ArrowRight: [0, step], ArrowUp: [step, 0], ArrowDown: [-step, 0] };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    centerLat = Math.max(-60, Math.min(60, centerLat + m[0]));
    centerLon += m[1];
    idleSince = performance.now();
    draw();
    onCenter?.(centerLat, centerLon);
  });

  // Only animate while on screen and the tab is visible.
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible && !document.hidden ? start() : stop();
  });
  io.observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  new ResizeObserver(resize).observe(canvas);
  resize();
  onCenter?.(centerLat, centerLon);

  if (reducedMotion) {
    // Static frame; still draggable.
    draw();
    onReady?.();
  } else {
    start();
  }
}

export function formatCoord(lat: number, lon: number) {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${ns} ${Math.abs(lon).toFixed(2)}°${ew}`;
}
