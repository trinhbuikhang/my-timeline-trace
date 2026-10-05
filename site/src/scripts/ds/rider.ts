/* The header rule is a track: a line follower rides it, becomes a UAV, then a humanoid as you read on. */
const rider = document.querySelector<HTMLElement>('[data-rider]');
if (rider) {
  const forms = rider.querySelectorAll('svg');
  let cur = -1;
  const ride = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    rider.style.setProperty('--x', `${(p * (rider.getBoundingClientRect().width - 18)).toFixed(1)}px`);
    const k = p < 0.36 ? 0 : p < 0.72 ? 1 : 2;
    if (k !== cur) { forms.forEach((f, i) => f.classList.toggle('on', i === k)); cur = k; }
  };
  addEventListener('scroll', ride, { passive: true });
  addEventListener('resize', ride);
  ride();
}
