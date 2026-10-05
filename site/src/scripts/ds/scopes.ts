/* 8 · Stories: each story is a scope capture. Its mood picks the waveform; it acquires, then locks on trigger. */
import { animate, reduce } from './core';

const CH = ['#f2d21b', '#25c4e6', '#e64aa9', '#5be37d'];
const waves: Record<string, (x: number, t: number) => number> = {
  dusk: (x, t) => Math.sin(x * 2.2 + t * 1.2) * 0.55,
  paper: (x, t) => (Math.sin(x * 1.6 + t * 1.6) > 0 ? 0.5 : -0.5) + Math.sin(x * 40) * 0.015,
  ember: (x, t) => { const u = (x + t * 0.8) % 6.28; return Math.exp(-u * 0.55) * Math.cos(u * 6) * 0.8; },
  field: (x, t) => (2 / Math.PI) * Math.asin(Math.sin(x * 1.8 + t)) * 0.55,
  ink: (x, t) => ((((x * 0.5 + t * 0.4) % 1) + 1) % 1 - 0.5) * 1.1,
};

document.querySelectorAll<HTMLElement>('[data-scope]').forEach((a, idx) => {
  const c = a.querySelector('canvas')!;
  const fn = waves[a.dataset.mood ?? 'ink'] ?? waves.ink, color = CH[idx % CH.length], ch = (idx % CH.length) + 1;
  let hover = false, phase = 0, lock = reduce ? 1 : 0;
  const set = (v: boolean) => () => { hover = v; };
  a.addEventListener('pointerenter', set(true)); a.addEventListener('pointerleave', set(false));
  a.addEventListener('focus', set(true)); a.addEventListener('blur', set(false));
  animate(c, (dt, t) => {
    const r = c.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2), w = r.width, h = r.height;
    if (!w) return;
    if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const ctx = c.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    if (t > 0.5 + idx * 0.35) lock = Math.min(1, lock + dt * 1.4);
    // graticule 10 × 8
    ctx.strokeStyle = 'rgba(190,220,210,0.16)'; ctx.lineWidth = 1; ctx.setLineDash([1, 3]); ctx.beginPath();
    for (let i = 1; i < 10; i++) { ctx.moveTo((w * i) / 10, 0); ctx.lineTo((w * i) / 10, h); }
    for (let j = 1; j < 8; j++) { ctx.moveTo(0, (h * j) / 8); ctx.lineTo(w, (h * j) / 8); }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(190,220,210,0.32)'; ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
    // story voice: slow drift, a little faster under the pointer
    phase += dt * (hover ? 1.4 : 0.35);
    const e = lock * lock * (3 - 2 * lock), jitter = (1 - e) * (Math.random() - 0.5) * 2.4;
    ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.shadowColor = color; ctx.shadowBlur = 4;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y = h / 2 - (fn((x / w) * 6.28 + jitter, phase) * e + (Math.random() - 0.5) * 0.35 * (1 - e)) * (h / 2);
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, h * 0.42 - 5); ctx.lineTo(7, h * 0.42); ctx.lineTo(0, h * 0.42 + 5); ctx.fill();
    ctx.font = '500 11px "Reddit Mono Variable", monospace';
    ctx.fillText(`CH${ch}  1.00 V/div`, 8, h - 8);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(220,235,230,0.7)'; ctx.fillText('10 ms/div', w - 8, h - 8);
    ctx.fillStyle = lock >= 1 ? '#7be0a0' : '#f2a33a'; ctx.fillText(lock >= 1 ? "TRIG'D" : 'AUTO…', w - 8, 16);
    ctx.textAlign = 'left';
  });
});
