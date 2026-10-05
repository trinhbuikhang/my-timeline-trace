/* Shared runtime for the datasheet homepage: colours, one animation ticker, section switch-on. */

export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const lang = document.documentElement.lang === 'en' ? 'en' : 'vi';

/** Current theme colours, re-read when the colour scheme changes. */
export const C = { ink: '', ink2: '', rule: '', band: '', accent: '', paper: '' };
const listeners: Array<() => void> = [];
function readColors() {
  const s = getComputedStyle(document.documentElement);
  const v = (n: string) => s.getPropertyValue(n).trim();
  Object.assign(C, { ink: v('--ink'), ink2: v('--ink-2'), rule: v('--rule'), band: v('--band'), accent: v('--accent'), paper: v('--paper') });
}
readColors();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readColors(); listeners.forEach((f) => f()); });
export const onColors = (f: () => void) => listeners.push(f);
export const isDark = () => parseInt(C.paper.slice(1, 3), 16) < 0x80;

type Frame = (dt: number, t: number) => void;
interface Job { fn: Frame; on: boolean; t: number }
const jobs: Job[] = [];

/** Runs `fn` every frame while `el` is on screen. Under reduced motion it draws once (and on resize). */
export function animate(el: Element, fn: Frame) {
  const job: Job = { fn, on: false, t: 0 };
  jobs.push(job);
  new IntersectionObserver(([e]) => { job.on = e.isIntersecting; }).observe(el);
  new ResizeObserver(() => fn(0, job.t)).observe(el);
  onColors(() => fn(0, job.t));
  return job;
}
if (!reduce) {
  let last = 0;
  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    if (!document.hidden) for (const j of jobs) if (j.on) { j.t += dt; j.fn(dt, j.t); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Sizes a canvas to its box at device resolution and clears it. */
export function fit(c: HTMLCanvasElement) {
  const r = c.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  if (c.width !== Math.round(r.width * dpr)) { c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr); }
  const ctx = c.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, r.width, r.height);
  return { ctx, w: r.width, h: r.height };
}

/** Sections switch on once, the first time they scroll into view. */
const hooks = new Map<string, () => void>();
export const onSection = (id: string, fn: () => void) => {
  hooks.set(id, fn);
  if (document.getElementById(id)?.classList.contains('on')) fn();
};
const io = new IntersectionObserver(
  (es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('on');
    io.unobserve(e.target);
    hooks.get(e.target.id)?.();
  }),
  { rootMargin: '0px 0px -18% 0px' },
);
document.querySelectorAll('section.ds').forEach((s) => (reduce ? s.classList.add('on') : io.observe(s)));

export const MONO = '500 11px "Reddit Mono Variable", monospace';
export const smooth = (x: number) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
