/* 4 · Product family: three small live drawings, one per generation. */
import { C, MONO, animate, fit, isDark, smooth } from './core';

type Pt = [number, number];
const sims: Record<string, (c: HTMLCanvasElement) => void> = { 'line-follower': lineFollower, uav, humanoid };
document.querySelectorAll<HTMLCanvasElement>('[data-sim]').forEach((c) => sims[c.dataset.sim!]?.(c));

function polyline(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
}

/** REV A — a real (tiny) controller: five IR sensors read the line, a P controller steers. */
function lineFollower(c: HTMLCanvasElement) {
  const N = 360;
  let track: Pt[] = [], trail: Pt[] = [], err = 0, lastW = 0;
  let robot = { x: 0, y: 0, a: 0 };
  const near = (x: number, y: number) => {
    let b = Infinity;
    for (const p of track) { const d = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (d < b) b = d; }
    return Math.sqrt(b);
  };
  animate(c, (dt) => {
    const { ctx, w, h } = fit(c), s = Math.min(w, h);
    if (!w) return;
    if (w !== lastW) {
      lastW = w; trail = [];
      track = Array.from({ length: N }, (_, i) => {
        const a = (i / N) * Math.PI * 2, r = 1 + 0.16 * Math.sin(3 * a) + 0.06 * Math.cos(5 * a);
        return [w / 2 + Math.cos(a) * r * w * 0.34, h / 2 + Math.sin(a) * r * h * 0.32] as Pt;
      });
      robot = { x: track[0][0], y: track[0][1], a: Math.atan2(track[1][1] - track[0][1], track[1][0] - track[0][0]) };
    }
    const lw = s * 0.03;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.setLineDash([1, 4]); ctx.beginPath();
    for (let x = 20; x < w; x += 20) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let y = 20; y < h; y += 20) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke(); ctx.setLineDash([]);
    polyline(ctx, track); ctx.closePath(); ctx.strokeStyle = C.ink; ctx.lineWidth = lw; ctx.stroke();

    // sense
    const L = s * 0.1, W = s * 0.075, sp = W * 0.24, ahead = L * 0.62;
    const fx = Math.cos(robot.a), fy = Math.sin(robot.a), nx = -fy, ny = fx;
    const hits: boolean[] = [];
    let sum = 0, cnt = 0;
    for (let k = -2; k <= 2; k++) {
      const on = near(robot.x + fx * ahead + nx * k * sp, robot.y + fy * ahead + ny * k * sp) < lw / 2;
      hits.push(on); if (on) { sum += k; cnt++; }
    }
    if (cnt) err = sum / cnt / 2;
    // act
    robot.a += 7.5 * err * dt;
    robot.x += fx * s * 0.32 * dt; robot.y += fy * s * 0.32 * dt;
    if (dt) { trail.push([robot.x, robot.y]); if (trail.length > 90) trail.shift(); }
    polyline(ctx, trail); ctx.strokeStyle = C.accent; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);

    // the robot, top view, in its own frame
    ctx.save(); ctx.translate(robot.x, robot.y); ctx.rotate(robot.a);
    ctx.lineWidth = 1.3; ctx.strokeStyle = C.ink; ctx.fillStyle = C.paper;
    ctx.fillRect(-L / 2, -W / 2, L, W); ctx.strokeRect(-L / 2, -W / 2, L, W);
    ctx.fillStyle = C.ink;
    ctx.fillRect(-L * 0.32, -W * 0.72, L * 0.34, W * 0.18); ctx.fillRect(-L * 0.32, W * 0.54, L * 0.34, W * 0.18);
    ctx.beginPath(); ctx.moveTo(L / 2, 0); ctx.lineTo(ahead, 0); ctx.stroke();
    ctx.fillStyle = C.paper; ctx.fillRect(ahead - 3, -W * 0.62, 6, W * 1.24); ctx.strokeRect(ahead - 3, -W * 0.62, 6, W * 1.24);
    hits.forEach((on, i) => {
      ctx.fillStyle = on ? C.accent : C.paper;
      ctx.beginPath(); ctx.arc(ahead, (i - 2) * sp, 2.6, 0, 7); ctx.fill(); ctx.stroke();
    });
    ctx.restore();

    ctx.font = MONO; ctx.fillStyle = C.ink2;
    ctx.fillText('IR ' + hits.map((b) => (b ? '■' : '□')).join(''), 10, h - 26);
    ctx.fillText(`e = ${err >= 0 ? '+' : ''}${err.toFixed(2)}`, 10, h - 11);
    ctx.textAlign = 'right'; ctx.fillText('x · y', w - 10, h - 11); ctx.textAlign = 'left';
  });
}

/** REV B — quadrotor: hovers and drifts, rotors spin in alternate directions. Adds an axis: z. */
function uav(c: HTMLCanvasElement) {
  const trail: Pt[] = [];
  animate(c, (dt, t) => {
    const { ctx, w, h } = fit(c), s = Math.min(w, h);
    if (!w) return;
    const cx = w * 0.46 + Math.sin(t * 0.45) * w * 0.16, cy = h * 0.5 + Math.sin(t * 0.7 + 1) * h * 0.14;
    const z = 0.5 + 0.5 * Math.sin(t * 1.1), yaw = Math.sin(t * 0.3) * 0.35 + Math.PI / 4;
    if (dt) { trail.push([cx, cy]); if (trail.length > 140) trail.shift(); }
    polyline(ctx, trail); ctx.strokeStyle = C.accent; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
    const R = s * 0.2, r = s * 0.085;
    const rotors = (ox: number, oy: number) =>
      [0, 1, 2, 3].map((i) => { const a = yaw + (i * Math.PI) / 2; return [cx + ox + Math.cos(a) * R, cy + oy + Math.sin(a) * R] as Pt; });

    // shadow on the ground: further away the higher it flies
    const off = 8 + z * 14;
    ctx.fillStyle = '#000'; ctx.globalAlpha = isDark() ? 0.45 : 0.07;
    for (const p of rotors(off, off * 1.2)) { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fill(); }
    ctx.beginPath(); ctx.arc(cx + off, cy + off * 1.2, s * 0.05, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;

    const pts = rotors(0, 0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(...pts[0]); ctx.lineTo(...pts[2]); ctx.moveTo(...pts[1]); ctx.lineTo(...pts[3]); ctx.stroke();
    pts.forEach((p, i) => {
      ctx.fillStyle = C.band; ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fill(); ctx.stroke();
      const dir = i % 2 ? 1 : -1, ang = t * 38 * dir;
      for (let g = 0; g < 3; g++) {
        const b = ang - dir * g * 0.22;
        ctx.globalAlpha = g ? 0.25 : 1; ctx.strokeStyle = C.ink; ctx.lineWidth = g ? 1 : 1.6;
        ctx.beginPath();
        ctx.moveTo(p[0] - Math.cos(b) * r * 0.92, p[1] - Math.sin(b) * r * 0.92);
        ctx.lineTo(p[0] + Math.cos(b) * r * 0.92, p[1] + Math.sin(b) * r * 0.92);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(p[0], p[1], 2.2, 0, 7); ctx.fill();
    });
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(yaw - Math.PI / 4);
    const b = s * 0.055;
    ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
    ctx.fillRect(-b, -b, 2 * b, 2 * b); ctx.strokeRect(-b, -b, 2 * b, 2 * b);
    ctx.fillStyle = C.accent; ctx.beginPath(); ctx.moveTo(b * 1.7, 0); ctx.lineTo(b * 1.1, -b * 0.45); ctx.lineTo(b * 1.1, b * 0.45); ctx.fill();
    ctx.restore();

    // z gauge
    const gx = w - 18, g0 = h * 0.18, g1 = h * 0.78;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, g0); ctx.lineTo(gx, g1);
    for (let k = 0; k <= 6; k++) { const y = g0 + ((g1 - g0) * k) / 6; ctx.moveTo(gx - 4, y); ctx.lineTo(gx, y); }
    ctx.stroke();
    const zy = g1 - (g1 - g0) * (0.3 + 0.5 * z);
    ctx.fillStyle = C.accent; ctx.beginPath(); ctx.moveTo(gx - 5, zy); ctx.lineTo(gx - 12, zy - 4); ctx.lineTo(gx - 12, zy + 4); ctx.fill();
    ctx.font = MONO; ctx.fillStyle = C.ink2; ctx.textAlign = 'center'; ctx.fillText('z', gx, g0 - 8); ctx.textAlign = 'left';
    ctx.fillText('x · y · z', 10, h - 11);
  });
}

/** REV ? — humanoid in phantom lines. A small network in the head sends impulses to the joints. */
function humanoid(c: HTMLCanvasElement) {
  const JOINTS = ['lS', 'lE', 'lW', 'rS', 'rE', 'rW', 'lH', 'lK', 'lA', 'rH', 'rK', 'rA'] as const;
  type JointId = (typeof JOINTS)[number];
  let pulses: { j: JointId; p: number }[] = [];
  const glow: Partial<Record<JointId, number>> = {};
  let net = 0, nextFire = 0.4;

  const along = (pts: Pt[], p: number): Pt => {
    const lens = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
    let d = p * lens.reduce((a, b) => a + b, 0);
    for (let k = 0; k < lens.length; k++) {
      if (d <= lens[k]) { const f = d / (lens[k] || 1); return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f]; }
      d -= lens[k];
    }
    return pts[pts.length - 1];
  };

  animate(c, (dt, t) => {
    const { ctx, w, h } = fit(c);
    if (!w) return;
    const u = h / 108, ox = w / 2 + Math.sin(t * 0.8) * u * 0.6, oy = h * 0.04;
    const P = (x: number, y: number): Pt => [ox + x * u, oy + y * u];
    // pose: the right arm waves now and then
    const cyc = t % 9, wv = smooth((cyc - 4) / 0.8) * (1 - smooth((cyc - 7.4) / 0.8));
    const la1 = 0.16 + Math.sin(t * 1.3) * 0.04, la2 = la1 + 0.12;
    const ra1 = (0.16 + Math.sin(t * 1.3 + 1) * 0.04) * (1 - wv) + 2.25 * wv;
    const ra2 = (ra1 + 0.12) * (1 - wv) + (2.75 + Math.sin(t * 6) * 0.35) * wv;
    const lS = P(-14, 30), rS = P(14, 30);
    const lE: Pt = [lS[0] - Math.sin(la1) * 17 * u, lS[1] + Math.cos(la1) * 17 * u];
    const rE: Pt = [rS[0] + Math.sin(ra1) * 17 * u, rS[1] + Math.cos(ra1) * 17 * u];
    const J: Record<JointId, Pt> = {
      lS, rS, lE, rE,
      lW: [lE[0] - Math.sin(la2) * 15 * u, lE[1] + Math.cos(la2) * 15 * u],
      rW: [rE[0] + Math.sin(ra2) * 15 * u, rE[1] + Math.cos(ra2) * 15 * u],
      lH: P(-7, 58), rH: P(7, 58), lK: P(-8, 78), rK: P(8, 78), lA: P(-8, 97), rA: P(8, 97),
    };
    const head = P(0, 15), neck = P(0, 24), chest = P(0, 30), pelvis = P(0, 56);

    // ground
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
    const gy = J.lA[1] + 3 * u;
    ctx.beginPath(); ctx.moveTo(ox - 30 * u, gy); ctx.lineTo(ox + 30 * u, gy);
    for (let k = -30; k < 30; k += 5) { ctx.moveTo(ox + k * u, gy); ctx.lineTo(ox + (k - 3) * u, gy + 3.5 * u); }
    ctx.stroke();

    // body in phantom lines (long dash, short dash): it does not exist yet
    ctx.setLineDash([9, 3, 2, 3]); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
    const line = (a: Pt, b: Pt) => { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); };
    ctx.beginPath(); ctx.arc(head[0], head[1], 9 * u, 0, 7); ctx.stroke();
    line(neck, chest);
    polyline(ctx, [P(-14, 28), P(14, 28), P(10, 54), P(-10, 54)]); ctx.closePath(); ctx.stroke();
    line(J.lS, J.lE); line(J.lE, J.lW); line(J.rS, J.rE); line(J.rE, J.rW);
    line(P(-10, 56), P(10, 56));
    line(J.lH, J.lK); line(J.lK, J.lA); line(J.rH, J.rK); line(J.rK, J.rA);
    line(J.lA, [J.lA[0] - 6 * u, J.lA[1]]); line(J.rA, [J.rA[0] + 6 * u, J.rA[1]]);
    ctx.setLineDash([]);

    // the head fires an impulse at a joint
    nextFire -= dt;
    if (nextFire <= 0 && dt) {
      nextFire = 0.35 + Math.random() * 0.4; net = 1;
      pulses.push({ j: JOINTS[(Math.random() * JOINTS.length) | 0], p: 0 });
    }
    net = Math.max(0, net - dt * 2.2);
    // a 3 → 4 → 2 network inside the head
    const nodes = ([[-5, [-4, 0, 4]], [0, [-5, -1.7, 1.7, 5]], [5, [-2.5, 2.5]]] as [number, number[]][])
      .map(([x, ys]) => ys.map((y) => [head[0] + x * u, head[1] + y * u] as Pt));
    ctx.lineWidth = 0.8; ctx.strokeStyle = C.accent; ctx.globalAlpha = 0.25 + net * 0.6;
    ctx.beginPath();
    for (let a = 0; a < 2; a++) for (const p of nodes[a]) for (const q of nodes[a + 1]) { ctx.moveTo(...p); ctx.lineTo(...q); }
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = C.accent;
    for (const L of nodes) for (const p of L) { ctx.beginPath(); ctx.arc(p[0], p[1], 1.5 + net * 0.8, 0, 7); ctx.fill(); }

    // impulses travel neck → spine → along the limb
    const route = (j: JointId): Pt[] => {
      const side = j[0] as 'l' | 'r', arm = 'SEW'.includes(j[1]);
      const r: Pt[] = [neck, arm ? chest : pelvis];
      for (const part of arm ? 'SEW' : 'HKA') { r.push(J[(side + part) as JointId]); if (part === j[1]) break; }
      return r;
    };
    pulses = pulses.filter((pl) => {
      pl.p += dt * 1.6;
      if (pl.p >= 1) { glow[pl.j] = 1; return false; }
      const q = along(route(pl.j), pl.p);
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(q[0], q[1], 2.4, 0, 7); ctx.fill();
      return true;
    });
    for (const j of JOINTS) {
      const g = glow[j] ?? 0;
      glow[j] = Math.max(0, g - dt * 1.5);
      const [x, y] = J[j];
      ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(x, y, 2.8, 0, 7); ctx.fill(); ctx.stroke();
      if (g > 0) {
        ctx.globalAlpha = g; ctx.fillStyle = C.accent; ctx.strokeStyle = C.accent;
        ctx.beginPath(); ctx.arc(x, y, 2.8, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 2.8 + (1 - g) * 9, 0, 7); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    ctx.font = MONO; ctx.fillStyle = C.ink2; ctx.fillText('DOF ?', 10, h - 11);
    ctx.textAlign = 'right'; ctx.fillStyle = C.accent; ctx.fillText('AI', w - 10, h - 11); ctx.textAlign = 'left';
  });
}
