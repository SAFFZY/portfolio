import { useEffect, useRef } from "react";

type Node = { x: number; y: number; bx: number; by: number; layer: number; glow: number; phase: number };
type Edge = { a: number; b: number; w: number };
type Signal = { edge: number; t: number; speed: number };

const LAYERS = [4, 7, 9, 7, 5, 3];

/**
 * A layered neural network drawn on canvas. Signals travel forward along the
 * edges, light up the neurons they reach and keep propagating. The cursor
 * nudges nearby neurons and clicking fires a burst from the closest one.
 */
export default function NeuralField({ moving }: { moving: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const movingRef = useRef(moving);
  movingRef.current = moving;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let outgoing: number[][] = [];
    let signals: Signal[] = [];
    let w = 0;
    let h = 0;
    let frame = 0;
    let last = performance.now();
    let spawnClock = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      nodes = [];
      const padX = w * 0.08;
      const padY = h * 0.12;
      LAYERS.forEach((count, layer) => {
        const x = padX + ((w - padX * 2) * layer) / (LAYERS.length - 1);
        for (let i = 0; i < count; i++) {
          const y = padY + ((h - padY * 2) * (i + 0.5)) / count + (Math.random() - 0.5) * 14;
          const jx = x + (Math.random() - 0.5) * 22;
          nodes.push({ x: jx, y, bx: jx, by: y, layer, glow: 0, phase: Math.random() * Math.PI * 2 });
        }
      });
      edges = [];
      outgoing = nodes.map(() => []);
      nodes.forEach((n, i) => {
        nodes.forEach((m, j) => {
          if (m.layer !== n.layer + 1) return;
          if (Math.random() < 0.55) {
            outgoing[i].push(edges.length);
            edges.push({ a: i, b: j, w: 0.25 + Math.random() * 0.75 });
          }
        });
      });
      signals = [];
    };

    const fire = (nodeIndex: number) => {
      nodes[nodeIndex].glow = 1;
      for (const e of outgoing[nodeIndex]) {
        if (Math.random() < 0.6 && signals.length < 140) signals.push({ edge: e, t: 0, speed: 0.6 + Math.random() * 0.7 });
      }
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      const time = performance.now() / 1000;

      for (const n of nodes) {
        let tx = n.bx + Math.sin(time * 0.6 + n.phase) * 4;
        let ty = n.by + Math.cos(time * 0.5 + n.phase) * 5;
        if (pointer.active) {
          const dx = n.bx - pointer.x;
          const dy = n.by - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < 160) {
            const f = (1 - d / 160) * 26;
            tx += (dx / (d || 1)) * f;
            ty += (dy / (d || 1)) * f;
            n.glow = Math.max(n.glow, (1 - d / 160) * 0.7);
          }
        }
        n.x += (tx - n.x) * Math.min(1, dt * 6);
        n.y += (ty - n.y) * Math.min(1, dt * 6);
        n.glow = Math.max(0, n.glow - dt * 0.9);
      }

      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const heat = Math.max(a.glow, b.glow);
        ctx.strokeStyle = `rgba(255, ${170 + heat * 40}, ${110 + heat * 30}, ${0.05 + e.w * 0.07 + heat * 0.25})`;
        ctx.lineWidth = 0.6 + heat * 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      const next: Signal[] = [];
      for (const s of signals) {
        s.t += dt * s.speed;
        const e = edges[s.edge];
        const a = nodes[e.a];
        const b = nodes[e.b];
        if (s.t >= 1) {
          fire(e.b);
          continue;
        }
        const x = a.x + (b.x - a.x) * s.t;
        const y = a.y + (b.y - a.y) * s.t;
        const tail = Math.max(0, s.t - 0.12);
        const grad = ctx.createLinearGradient(a.x + (b.x - a.x) * tail, a.y + (b.y - a.y) * tail, x, y);
        grad.addColorStop(0, "rgba(255,153,51,0)");
        grad.addColorStop(1, "rgba(255,190,120,0.95)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a.x + (b.x - a.x) * tail, a.y + (b.y - a.y) * tail);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = "#ffd3a1";
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        next.push(s);
      }
      signals = next;

      for (const n of nodes) {
        const r = 3.2 + n.glow * 3;
        if (n.glow > 0.05) {
          const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 26 * n.glow + 6);
          halo.addColorStop(0, `rgba(255,153,51,${0.45 * n.glow})`);
          halo.addColorStop(1, "rgba(255,153,51,0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 26 * n.glow + 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = n.glow > 0.05 ? `rgba(255,${180 + 50 * n.glow},${130 + 60 * n.glow},1)` : "#0d0b09";
        ctx.strokeStyle = `rgba(255,170,100,${0.45 + n.glow * 0.55})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (movingRef.current && !reduced) {
        spawnClock -= dt;
        if (spawnClock <= 0) {
          const inputs = nodes.filter((n) => n.layer === 0);
          fire(nodes.indexOf(inputs[Math.floor(Math.random() * inputs.length)]));
          spawnClock = 0.35 + Math.random() * 0.5;
        }
        draw(dt);
      }
      frame = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = pointer.x > -40 && pointer.y > -40 && pointer.x < w + 40 && pointer.y < h + 40;
    };
    const onLeave = () => (pointer.active = false);
    const onClick = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      let best = 0;
      let bestD = Infinity;
      nodes.forEach((n, i) => {
        const d = Math.hypot(n.x - x, n.y - y);
        if (d < bestD && n.layer < LAYERS.length - 1) {
          bestD = d;
          best = i;
        }
      });
      fire(best);
      for (const e of outgoing[best]) signals.push({ edge: e, t: 0, speed: 1.2 });
    };

    build();
    draw(0.016);
    frame = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => {
      build();
      draw(0.016);
    });
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onClick);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onClick);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true" />;
}
