type Props = {
  size?: number;
  lobes?: number;
  strands?: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
};

// Hypotrochoid with an integer radius ratio, so each strand closes after one turn.
function strand(c: number, R: number, lobes: number, d: number, rotation: number) {
  const r = R / lobes;
  const steps = lobes * 24;
  let path = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = (R - r) * Math.cos(t) + d * Math.cos((lobes - 1) * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin((lobes - 1) * t);
    const xr = x * Math.cos(rotation) - y * Math.sin(rotation);
    const yr = x * Math.sin(rotation) + y * Math.cos(rotation);
    path += `${i ? "L" : "M"}${(c + xr).toFixed(1)} ${(c + yr).toFixed(1)}`;
  }
  return path + "Z";
}

export default function Guilloche({
  size = 240,
  lobes = 18,
  strands = 10,
  stroke = "currentColor",
  strokeWidth = 0.6,
  className = "",
}: Props) {
  const c = size / 2;
  const paths: string[] = [];
  const step = (Math.PI * 2) / lobes / strands;
  for (let j = 0; j < strands; j++) {
    paths.push(strand(c, size * 0.36, lobes, size * 0.1, j * step));
    paths.push(strand(c, size * 0.2, Math.round(lobes * 0.6), size * 0.07, j * step * 1.6));
  }
  return (
    <svg aria-hidden viewBox={`0 0 ${size} ${size}`} className={className} fill="none" stroke={stroke} strokeWidth={strokeWidth}>
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
