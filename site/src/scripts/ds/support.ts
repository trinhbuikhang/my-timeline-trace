/* 10 · Support: hovering an order charges the lab's battery. */
const batt = document.querySelector<SVGSVGElement>('[data-batt]');
const vcc = document.querySelector<HTMLElement>('[data-vcc]');
if (batt && vcc) {
  const low = vcc.textContent;
  document.querySelectorAll<HTMLElement>('[data-level]').forEach((tr) => {
    tr.addEventListener('pointerenter', () => {
      batt.dataset.charge = tr.dataset.level;
      vcc.textContent = `VCC: ${['', '33%', '66%', '100%'][Number(tr.dataset.level)]}`;
    });
    tr.addEventListener('pointerleave', () => { delete batt.dataset.charge; vcc.textContent = low; });
  });
}
