"use client";

import { useState } from "react";

const ASSETS = [
  { id: 1, label: "US Treasury bill", apy: 5.2 },
  { id: 2, label: "Apple corporate bond", apy: 7.5 },
  { id: 3, label: "Manhattan REIT", apy: 8.0 },
];

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function YieldEstimator() {
  const [assetId, setAssetId] = useState(2);
  const [amount, setAmount] = useState(5000);
  const [months, setMonths] = useState(12);

  const asset = ASSETS.find((a) => a.id === assetId)!;
  const yieldPyt = (amount * asset.apy * months) / 1200;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-mint-100 px-6 py-12 sm:px-14 sm:py-16">
      <div
        aria-hidden
        className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-lilac-300/70"
      />
      <div className="relative">
        <h2 className="text-center text-5xl font-semibold leading-[0.95] tracking-display sm:text-7xl">
          Put an asset
          <br />
          to work
        </h2>

        <div className="mx-auto mt-10 max-w-2xl rounded-full bg-white p-2 shadow-[0_1px_0_rgba(17,19,24,0.04)]">
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="asset">Asset</label>
            <select
              id="asset"
              value={assetId}
              onChange={(e) => setAssetId(Number(e.target.value))}
              className="min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-transparent px-5 py-3 text-lg outline-none"
            >
              {ASSETS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}, {a.apy}% APY</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="amount">Amount in USD</label>
            <div className="flex items-center border-l border-line pl-4">
              <span className="text-lg text-muted">$</span>
              <input
                id="amount"
                type="number"
                min={100}
                step={100}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-24 bg-transparent px-1 py-3 text-lg outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 flex max-w-2xl items-center gap-4 px-2">
          <label htmlFor="months" className="shrink-0 text-sm text-muted">Hold for {months} months</label>
          <input
            id="months"
            type="range"
            min={1}
            max={24}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full accent-lilac-500"
          />
        </div>

        <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4 text-center">
          <div>
            <dt className="text-sm text-muted">You receive</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight">{amount.toLocaleString()} PYT</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Yield earned</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gain">
              +{yieldPyt.toLocaleString(undefined, { maximumFractionDigits: 2 })} PYT
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Worth at the end</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight">{usd(amount + yieldPyt)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
