"use client";

import { useEffect, useState } from "react";

const SECONDS_PER_YEAR = 31_536_000;

export default function LiveAccrual({
  faceValue,
  apyBps,
  start,
  decimals = 6,
}: {
  faceValue: number;
  apyBps: number;
  start: number;
  decimals?: number;
}) {
  const [value, setValue] = useState(start);

  useEffect(() => {
    const perMs = (faceValue * apyBps) / 10_000 / SECONDS_PER_YEAR / 1000;
    const t0 = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setInterval(() => setValue(start + (performance.now() - t0) * perMs), reduce ? 1000 : 80);
    return () => clearInterval(id);
  }, [faceValue, apyBps, start]);

  return (
    <span className="tabular-nums">
      {value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}
