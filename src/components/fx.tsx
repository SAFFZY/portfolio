import { useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#01";

/** Text that "decodes" from random glyphs when it scrolls into view or is hovered. */
export function Scramble({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(text);
  const run = useRef<() => void>(() => {});

  useEffect(() => {
    let raf = 0;
    run.current = () => {
      if (document.documentElement.dataset.motion === "paused") return;
      cancelAnimationFrame(raf);
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 700);
        const revealed = Math.floor(p * text.length);
        setOut(
          text
            .split("")
            .map((c, i) => (i < revealed || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join(""),
        );
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run.current();
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    if (ref.current) io.observe(ref.current);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [text]);

  return (
    <span ref={ref} className={className} aria-label={text} onMouseEnter={() => run.current()}>
      <span aria-hidden="true">{out}</span>
    </span>
  );
}

/** Streams a sentence token by token, like a model generating it. */
export function TokenStream({ text, start }: { text: string; start: boolean }) {
  const tokens = text.match(/\S+\s*/g) ?? [];
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(tokens.length);
      return;
    }
    let i = 0;
    let id = 0;
    const step = () => {
      i += 1;
      setCount(i);
      if (i < tokens.length) id = window.setTimeout(step, 45 + Math.random() * 90);
    };
    id = window.setTimeout(step, 300);
    return () => clearTimeout(id);
  }, [start, tokens.length]);

  return (
    <p className="token-stream" aria-label={text}>
      <span className="prompt" aria-hidden="true">
        saffran.generate(<i>"about"</i>) →
      </span>
      <span aria-hidden="true">
        {tokens.slice(0, count).map((t, i) => (
          <span key={i} className="token">
            {t}
          </span>
        ))}
        <span className={`caret ${count >= tokens.length ? "done" : ""}`} />
      </span>
    </p>
  );
}

/** Dot + ring cursor that grows over interactive elements. Desktop only. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    let raf = 0;
    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const target = (e.target as HTMLElement).closest<HTMLElement>("a, button, summary, [data-cursor]");
      ring.current?.classList.toggle("is-hover", !!target);
      const text = target?.dataset.cursor ?? "";
      ring.current?.classList.toggle("has-label", !!text);
      if (label.current) label.current.textContent = text;
    };
    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px)`;
      raf = requestAnimationFrame(loop);
    };
    const down = () => ring.current?.classList.add("is-down");
    const up = () => ring.current?.classList.remove("is-down");
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);
  return (
    <>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
      <div className="cursor-ring" ref={ring} aria-hidden="true">
        <span ref={label} />
      </div>
    </>
  );
}

/** Opening screen: a "model loading" counter, then the panel lifts away. */
export function Loader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 200 : 1600;
    const start = performance.now();
    let raf = 0;
    let timeout = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setPct(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setLeaving(true);
        onDone();
        timeout = window.setTimeout(() => setGone(true), reduced ? 50 : 1100);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [onDone]);
  if (gone) return null;
  const stage = pct < 35 ? "loading weights" : pct < 70 ? "warming up attention" : pct < 100 ? "sampling ideas" : "ready";
  return (
    <div className={`loader ${leaving ? "is-leaving" : ""}`} aria-hidden="true">
      <div className="loader-mark">
        S<span>✳</span>M
      </div>
      <div className="loader-meta">
        <span>{stage}…</span>
        <span>{String(pct).padStart(3, "0")}%</span>
      </div>
      <div className="loader-bar">
        <i style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
    </div>
  );
}

export function useIstTime(timeZone: string) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(time);
}
