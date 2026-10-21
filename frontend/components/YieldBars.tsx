const BAR_COUNT = 180;

// Deterministic so server and client render the same heights.
const heights = Array.from({ length: BAR_COUNT }, (_, i) => {
  const t = i / (BAR_COUNT - 1);
  const growth = Math.pow(t, 1.6);
  const ripple = (Math.sin(i * 1.7) + Math.sin(i * 0.43)) * 0.06;
  return Math.min(1, Math.max(0.12, 0.18 + growth * 0.78 + ripple));
});

export default function YieldBars({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex h-28 w-full items-end gap-[3px] overflow-hidden ${className}`}>
      {heights.map((h, i) => (
        <span
          key={i}
          className="bar min-w-0 flex-1 rounded-t-sm bg-gradient-to-t from-aqua via-lilac-300 to-lilac-300"
          style={{ height: `${h * 100}%`, animationDelay: `${i * 6}ms` }}
        />
      ))}
    </div>
  );
}
