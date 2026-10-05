/* 9 · Trace as a bus timing diagram: captured left to right like a logic analyser; hover reads the year. */
import { C, onColors, onSection, reduce } from './core';

const svg = document.querySelector<SVGSVGElement>('[data-timing]');
if (svg) init(svg);

function init(svg: SVGSVGElement) {
  const marks: { year: number; label: string }[] = JSON.parse(svg.dataset.marks || '[]');
  const futureLabel = svg.dataset.future || '?';
  let W = 900, segs: [number, number, number, number][] = [], futureX = Infinity, captured = reduce;

  function draw() {
    W = svg.getBoundingClientRect().width || 900;
    const H = 130, top = 46, bh = 34, sl = 8, y0 = top, y1 = top + bh, mid = y0 + bh / 2;
    const weights = marks.map((m, i) => 1 + Math.log2((i < marks.length - 1 ? marks[i + 1].year - m.year : 2) + 1));
    const tot = weights.reduce((a, b) => a + b, 0) + 1.6;
    let out =
      `<defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="${C.paper}"/><line x1="0" y1="0" x2="0" y2="7" stroke="${C.ink2}" stroke-width="1.2"/></pattern>` +
      `<clipPath id="cap"><rect data-cap x="-20" y="0" height="${H}" width="${captured ? W + 40 : 0}"/></clipPath></defs><g clip-path="url(#cap)">`;
    segs = [];
    let x = 0;
    marks.forEach((m, i) => {
      const w = (weights[i] / tot) * (W - 2), xa = x + 1, xb = x + w + 1, cur = i === marks.length - 1;
      segs.push([xa, xb, m.year, i < marks.length - 1 ? marks[i + 1].year : m.year + 1]);
      out += `<path class="ln${cur ? ' cur' : ''}" d="M${xa} ${mid} L${xa + sl} ${y0} H${xb - sl} L${xb} ${mid} L${xb - sl} ${y1} H${xa + sl} Z"/>`;
      const cls = cur ? ' class="curt"' : '';
      const inside = xb - xa - 2 * sl > m.label.length * 6.6;
      if (inside) out += `<text x="${xa + sl + 6}" y="${mid + 4.5}"${cls}>${m.label}</text>`;
      else {
        // too narrow: label hangs below on a leader, and the year moves above out of its way
        out += `<text x="${xa + sl}" y="${y1 + 34}"${cls}>${m.label}</text>`;
        out += `<line class="tick" x1="${xa + sl + 4}" x2="${xa + sl + 4}" y1="${y1}" y2="${y1 + 22}"/>`;
      }
      out += `<text class="yr" x="${xa}" y="${!inside || i % 2 ? y0 - 8 : y1 + 16}">${m.year}</text>`;
      x += w;
    });
    const fa = x + 1, fb = W - 1;
    futureX = fa;
    out += `<path class="x" d="M${fa} ${mid} L${fa + sl} ${y0} H${fb} V${y1} H${fa + sl} Z"/>`;
    out += `<path class="ln" d="M${fa} ${mid} L${fa + sl} ${y0} H${fb} M${fa} ${mid} L${fa + sl} ${y1} H${fb}"/>`;
    out += `<text class="yr" x="${fb}" y="${y1 + 16}" text-anchor="end">?</text></g>`;
    out += `<line class="head" data-head x1="0" x2="0" y1="${top - 30}" y2="${y1 + 30}" style="display:none"/>`;
    out += `<g class="cursor" data-cursor style="display:none"><line y1="${top - 26}" y2="${y1 + 4}"/><rect y="${top - 42}" height="16" width="60" rx="1"/><text y="${top - 30}"></text></g>`;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = out;
  }
  draw();
  new ResizeObserver(draw).observe(svg.parentElement!);
  onColors(draw);

  onSection('trace', () => {
    if (reduce) return;
    const t0 = performance.now(), dur = 1600;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur), xw = (1 - (1 - p) ** 2) * (W + 40);
      svg.querySelector('[data-cap]')?.setAttribute('width', String(xw));
      const head = svg.querySelector<SVGLineElement>('[data-head]');
      if (head) { head.style.display = p < 1 ? '' : 'none'; head.setAttribute('x1', String(xw - 20)); head.setAttribute('x2', String(xw - 20)); }
      if (p < 1) requestAnimationFrame(step); else captured = true;
    };
    requestAnimationFrame(step);
  });

  svg.addEventListener('pointermove', (e) => {
    const cur = svg.querySelector<SVGGElement>('[data-cursor]');
    if (!cur) return;
    const r = svg.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width) * W;
    let label = '?';
    for (const [xa, xb, a, b] of segs) if (x >= xa && x < xb) label = `≈ ${Math.floor(a + ((x - xa) / (xb - xa)) * (b - a))}`;
    if (x >= futureX) label = futureLabel;
    cur.style.display = '';
    const ln = cur.querySelector('line')!, rect = cur.querySelector('rect')!, tx = cur.querySelector('text')!;
    ln.setAttribute('x1', String(x)); ln.setAttribute('x2', String(x));
    const rw = label.length * 7 + 12, rx = Math.min(Math.max(x - rw / 2, 0), W - rw);
    rect.setAttribute('x', String(rx)); rect.setAttribute('width', String(rw));
    tx.setAttribute('x', String(rx + 6)); tx.textContent = label;
  });
  svg.addEventListener('pointerleave', () => {
    const cur = svg.querySelector<SVGGElement>('[data-cursor]');
    if (cur) cur.style.display = 'none';
  });
}
