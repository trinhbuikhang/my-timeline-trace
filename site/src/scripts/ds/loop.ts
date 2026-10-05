/* 5 · Figure 3: a signal travels the loop; every pass, the step response overshoots less. */
import { animate, reduce } from './core';

const svg = document.querySelector<SVGSVGElement>('[data-loop]');
if (svg) {
  const $ = (id: string) => svg.querySelector<SVGElement>(`[data-${id}]`)!;
  const sig = $('sig'), resp = $('resp'), old1 = $('old1'), old2 = $('old2'), label = $('iter');
  const L = { iteration: svg.dataset.lIteration!, overshoot: svg.dataset.lOvershoot! };

  const pts: [number, number][] = [[8, 100], [72, 100], [490, 100], [490, 200], [72, 200], [72, 100]];
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  const at = (t: number) => {
    let d = t * total;
    for (let k = 0; k < lens.length; k++) {
      if (d <= lens[k]) { const f = d / lens[k]; return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f]; }
      d -= lens[k];
    }
    return pts[pts.length - 1];
  };

  const ZETA = [0.12, 0.25, 0.42, 0.62, 0.85];
  // under-damped second-order step response, 470 × 100 box, r = 1 at y = 30
  const step = (z: number, upto: number) => {
    const wd = Math.sqrt(1 - z * z), phi = Math.acos(z);
    let d = '';
    for (let x = 0; x <= 470 * upto; x += 3) {
      const tau = (x / 470) * 16, y = 1 - (Math.exp(-z * tau) / wd) * Math.sin(wd * tau + phi);
      d += `${x ? 'L' : 'M'}${x} ${(100 - y * 70).toFixed(1)}`;
    }
    return d;
  };
  const overshoot = (z: number) => Math.round(100 * Math.exp((-z * Math.PI) / Math.sqrt(1 - z * z)));

  let lastPass = -1;
  animate(svg, (_dt, t) => {
    const cyc = t / 6, n = Math.floor(cyc), p = cyc - n, k = n % ZETA.length;
    if (n !== lastPass) {
      lastPass = n;
      old1.setAttribute('d', k >= 1 ? step(ZETA[k - 1], 1) : '');
      old2.setAttribute('d', k >= 2 ? step(ZETA[k - 2], 1) : '');
      label.textContent = `${L.iteration} ${k + 1} · ${L.overshoot} ${overshoot(ZETA[k])}%`;
    }
    const q = at(p);
    sig.setAttribute('cx', String(q[0])); sig.setAttribute('cy', String(q[1]));
    resp.setAttribute('d', step(ZETA[k], reduce ? 1 : Math.min(1, p * 1.25)));
  });
}
