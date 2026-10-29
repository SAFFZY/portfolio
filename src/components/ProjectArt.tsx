import type { Project } from "../data/profile";

// Small deterministic random so each artwork looks the same on every render.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export default function ProjectArt({ art, seed = 7 }: { art: Project["art"]; seed?: number }) {
  const r = rng(seed * 997 + 13);
  return (
    <svg className={`project-art art-${art}`} viewBox="0 0 400 300" aria-hidden="true">
      <defs>
        <radialGradient id={`glow-${art}`} cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#ff9933" stopOpacity=".28" />
          <stop offset="1" stopColor="#ff9933" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#glow-${art})`} />
      {art === "graph" &&
        (() => {
          const pts = Array.from({ length: 16 }, () => [40 + r() * 320, 30 + r() * 240]);
          return (
            <g>
              {pts.map(([x, y], i) =>
                pts.slice(i + 1).map(([x2, y2], j) =>
                  Math.hypot(x - x2, y - y2) < 110 ? (
                    <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} className="art-line" />
                  ) : null,
                ),
              )}
              {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 6 : 3} className={i % 4 === 0 ? "art-node hot" : "art-node"} style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </g>
          );
        })()}
      {art === "rings" && (
        <g transform="translate(200 150)">
          {[30, 55, 80, 105, 130].map((rad, i) => (
            <circle key={rad} r={rad} className="art-ring" strokeDasharray={`${4 + i * 3} ${8 + i * 2}`} style={{ animationDuration: `${12 + i * 5}s`, animationDirection: i % 2 ? "reverse" : "normal" }} />
          ))}
          <circle r="10" className="art-node hot" />
        </g>
      )}
      {art === "bars" && (
        <g>
          {Array.from({ length: 18 }, (_, i) => {
            const bh = 30 + r() * 180;
            return <rect key={i} x={30 + i * 19} y={260 - bh} width="10" height={bh} className={i === 11 ? "art-bar hot" : "art-bar"} style={{ animationDelay: `${i * 0.06}s` }} />;
          })}
          <line x1="20" y1="262" x2="380" y2="262" className="art-line" />
        </g>
      )}
      {art === "wave" && (
        <g>
          {Array.from({ length: 9 }, (_, i) => {
            const y = 60 + i * 22;
            const d = `M0 ${y} C 100 ${y - 40 - i * 3}, 160 ${y + 40}, 200 ${y} S 320 ${y - 40}, 400 ${y}`;
            return <path key={i} d={d} className={i === 4 ? "art-wave hot" : "art-wave"} style={{ animationDelay: `${i * 0.2}s` }} />;
          })}
        </g>
      )}
      {art === "grid" && (
        <g>
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 11 }, (_, col) => {
              const on = r() > 0.78;
              return <rect key={`${row}-${col}`} x={28 + col * 32} y={22 + row * 33} width="18" height="18" rx="3" className={on ? "art-cell hot" : "art-cell"} style={{ animationDelay: `${(row + col) * 0.08}s` }} />;
            }),
          )}
        </g>
      )}
      {art === "orbit" && (
        <g transform="translate(200 150)">
          <ellipse rx="150" ry="52" className="art-ring" transform="rotate(-18)" />
          <ellipse rx="110" ry="88" className="art-ring" transform="rotate(30)" />
          <ellipse rx="70" ry="120" className="art-ring" />
          <g className="art-spin">
            <circle cx="150" cy="0" r="6" className="art-node hot" transform="rotate(-18)" />
          </g>
          <g className="art-spin slow">
            <circle cx="0" cy="-120" r="4" className="art-node hot" />
          </g>
          <circle r="22" className="art-node core" />
        </g>
      )}
    </svg>
  );
}
