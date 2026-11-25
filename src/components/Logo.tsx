/** Hördle-Logo: eine kleine Schallwelle, dazu der Name. Die Balken wippen leicht (nicht bei reduzierter Bewegung). */
const HEIGHTS = [18, 32, 46, 58, 38, 26, 14];

export function LogoMark({ className = "h-14 w-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Schallwelle">
      {HEIGHTS.map((h, i) => (
        <rect
          key={i}
          className="wave-bar"
          style={{ ["--i" as string]: i } as React.CSSProperties}
          x={3 + i * 8.5}
          y={32 - h / 2}
          width={5}
          height={h}
          rx={2.5}
          fill={i === 3 ? "var(--accent)" : "var(--primary)"}
        />
      ))}
    </svg>
  );
}

export function Logo() {
  return (
    <div className="flex flex-col items-center">
      <LogoMark />
      <h1 className="mt-2 text-center text-5xl font-extrabold tracking-tight">Hör<span className="text-primary">dle</span></h1>
    </div>
  );
}
