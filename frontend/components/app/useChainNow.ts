"use client";

import { useEffect, useRef, useState } from "react";
import { useBlock } from "wagmi";

/**
 * Seconds-since-epoch as the chain sees it, ticking every second.
 * Local chains can be fast-forwarded past wall-clock time, so this extrapolates
 * from the latest block rather than trusting Date.now() alone.
 */
export function useChainNow(chainId: number) {
  const { data: block } = useBlock({ chainId, watch: true });
  const anchor = useRef<{ chainTs: number; seenAt: number } | null>(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (block) anchor.current = { chainTs: Number(block.timestamp), seenAt: Date.now() };
  }, [block]);

  useEffect(() => {
    const tick = () => {
      const wall = Date.now() / 1000;
      const a = anchor.current;
      const fromBlock = a ? a.chainTs + (Date.now() - a.seenAt) / 1000 : wall;
      setNow(Math.floor(Math.max(wall, fromBlock)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}
