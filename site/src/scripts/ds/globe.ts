/* Figure 1 — orthographic globe in datasheet line art. Drag (with inertia), arrow keys, slow auto-rotation. */
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from 'd3-geo';
import type { GeoPermissibleObjects } from 'd3-geo';
import { C, MONO, onColors, reduce } from './core';

interface Place { id: string; name: string; lat: number; lon: number; approx: boolean }

const fmt = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;

const canvas = document.querySelector<HTMLCanvasElement>('[data-globe]');
if (canvas) init(canvas);

function init(canvas: HTMLCanvasElement) {
  const places: Place[] = JSON.parse(canvas.dataset.places || '[]');
  const readout = document.querySelector<HTMLElement>('[data-globe-center]');
  const ctx = canvas.getContext('2d')!;
  const proj = geoOrthographic().clipAngle(90).precision(0.4);
  const path = geoPath(proj, ctx);
  const grat = geoGraticule10();
  const journey: GeoPermissibleObjects | null = places.length > 1
    ? (() => {
        const f = geoInterpolate([places[0].lon, places[0].lat], [places[1].lon, places[1].lat]);
        return { type: 'LineString', coordinates: Array.from({ length: 49 }, (_, i) => f(i / 48)) };
      })()
    : null;

  let land: GeoPermissibleObjects | null = null;
  let landIn = reduce ? 1 : 0;
  fetch('/land.json').then((r) => r.json()).then((g) => { land = g; draw(); start(); });

  const rot: [number, number, number] = [-140, 14, 0];
  let w = 0, h = 0, dpr = 1, t = 0, last = 0, raf = 0, running = false, onScreen = true;
  let drag: [number, number] | null = null, vel: [number, number] = [0, 0], idle = -1e9;
  const clamp = (v: number) => Math.max(-70, Math.min(70, v));

  function size() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    proj.scale(0.42 * Math.min(w, h)).translate([w / 2, h / 2]);
    draw();
  }

  function draw() {
    if (!w) return;
    proj.rotate(rot);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath(); path(grat); ctx.strokeStyle = C.rule; ctx.lineWidth = 0.7; ctx.stroke();
    const e = 1 - Math.pow(1 - landIn, 3);
    if (land) {
      ctx.globalAlpha = e;
      ctx.beginPath(); path(land); ctx.fillStyle = C.band; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 0.9; ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.stroke();
    const center: [number, number] = [-rot[0], -rot[1]];
    if (readout) readout.textContent = fmt(center[1], center[0]);
    if (!land || landIn < 1) return;
    if (journey) {
      ctx.beginPath(); path(journey); ctx.strokeStyle = C.accent; ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 4]); ctx.lineDashOffset = reduce ? 0 : -t * 10; ctx.stroke(); ctx.setLineDash([]);
    }
    places.forEach((pl, i) => {
      if (geoDistance([pl.lon, pl.lat], center) > Math.PI / 2 - 0.05) return;
      const p = proj([pl.lon, pl.lat])!;
      ctx.fillStyle = C.accent; ctx.fillRect(p[0] - 4, p[1] - 4, 8, 8);
      // test-point net label, like on a schematic
      ctx.font = '700 12px "Archivo Variable", sans-serif';
      const label = `TP${i + 1} · ${pl.name.toUpperCase()}`;
      const tw = ctx.measureText(label).width;
      const right = p[0] + tw + 40 < w;
      const x = right ? p[0] + 14 : p[0] - 26 - tw, y = p[1] - 12;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(right ? x : x + tw + 12, y + 9); ctx.stroke();
      ctx.fillStyle = C.paper; ctx.fillRect(x, y, tw + 12, 18); ctx.strokeRect(x, y, tw + 12, 18);
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(label, x + 6, y + 13);
      ctx.font = MONO; ctx.fillStyle = C.ink2;
      ctx.fillText(`${pl.approx ? '≈ ' : ''}${fmt(pl.lat, pl.lon)}`, x, y + 32);
    });
  }

  function frame(now: number) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now; t += dt;
    if (land && landIn < 1) landIn = Math.min(1, landIn + dt / 1.6);
    if (!drag) {
      if (Math.abs(vel[0]) + Math.abs(vel[1]) > 0.02) {
        rot[0] += vel[0]; rot[1] = clamp(rot[1] + vel[1]); vel[0] *= 0.92; vel[1] *= 0.92;
      } else if (!reduce && now - idle > 2200) rot[0] += 2.2 * dt;
    }
    draw();
    if (reduce && !drag && Math.abs(vel[0]) + Math.abs(vel[1]) <= 0.02 && landIn >= 1) running = false;
    raf = running ? requestAnimationFrame(frame) : 0;
  }
  function start() { if (running || !onScreen || document.hidden) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  canvas.addEventListener('pointerdown', (e) => {
    drag = [e.clientX, e.clientY]; vel = [0, 0];
    canvas.setPointerCapture(e.pointerId); canvas.classList.add('is-dragging'); start();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const k = 70 / proj.scale();
    vel = [(e.clientX - drag[0]) * k, -(e.clientY - drag[1]) * k];
    rot[0] += vel[0]; rot[1] = clamp(rot[1] + vel[1]);
    drag = [e.clientX, e.clientY];
  });
  const up = () => { if (!drag) return; drag = null; idle = performance.now(); canvas.classList.remove('is-dragging'); };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('keydown', (e) => {
    const m = ({ ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] } as Record<string, number[]>)[e.key];
    if (!m) return;
    e.preventDefault(); rot[0] -= m[0]; rot[1] = clamp(rot[1] + m[1]); idle = performance.now(); draw();
  });
  let firstSeen = true;
  new IntersectionObserver(([en]) => {
    onScreen = en.isIntersecting;
    // Below the fold at load: skip the fade so the globe is complete whenever it is reached.
    if (firstSeen && !onScreen) landIn = 1;
    firstSeen = false;
    onScreen ? start() : stop();
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  new ResizeObserver(size).observe(canvas);
  onColors(draw);
  size();
  start();
}
