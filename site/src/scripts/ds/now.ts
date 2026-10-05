/* 6 · NOW: a probe sweeps the table, then each reading settles like a multimeter. */
import { onSection, reduce } from './core';

onSection('now', () => {
  if (reduce) return;
  const meter = document.querySelector<HTMLElement>('[data-meter]');
  meter?.style.setProperty('--h', `${meter.offsetHeight}px`);
  const GLYPHS = '0123456789ABCDEF#%▒';
  document.querySelectorAll<HTMLElement>('[data-reading]').forEach((el, i) => {
    const final = el.textContent ?? '', start = performance.now() + 120 + i * 160, dur = 700;
    const step = (now: number) => {
      const p = Math.max(0, (now - start) / dur);
      if (p >= 1) { el.textContent = final; return; }
      const k = Math.floor(final.length * p);
      let out = final.slice(0, k);
      for (let j = k; j < final.length; j++) out += final[j] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = out;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
});
