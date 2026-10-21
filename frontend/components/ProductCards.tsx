import { ArrowDown, Check } from "lucide-react";

function Tag({ children, tone }: { children: React.ReactNode; tone: "lilac" | "mint" }) {
  const tones = { lilac: "bg-lilac-100 text-lilac-500", mint: "bg-mint-100 text-gain" };
  return <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function Gauge({ value }: { value: number }) {
  const r = 26;
  const half = Math.PI * r;
  return (
    <svg width="64" height="36" viewBox="0 0 64 36" aria-hidden>
      <path d="M6 32 A26 26 0 0 1 58 32" fill="none" stroke="#ece5ff" strokeWidth="9" />
      <path
        d="M6 32 A26 26 0 0 1 58 32"
        fill="none"
        stroke="#cbb4ff"
        strokeWidth="9"
        strokeDasharray={`${half * value} ${half}`}
      />
    </svg>
  );
}

function Donut({ value }: { value: number }) {
  const c = 2 * Math.PI * 14;
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden className="-rotate-90">
      <circle cx="20" cy="20" r="14" fill="none" stroke="#e3efea" strokeWidth="7" />
      <circle cx="20" cy="20" r="14" fill="none" stroke="#79e0cc" strokeWidth="7" strokeDasharray={`${c * value} ${c}`} />
    </svg>
  );
}

export function PositionCard() {
  return (
    <div className="grid grid-cols-2 divide-x divide-line rounded-xl bg-white p-6 shadow-sm">
      <div className="pr-6">
        <Tag tone="lilac">Staked</Tag>
        <p className="mt-4 text-sm font-medium">Apple corporate bond</p>
        <div className="mt-1 flex items-end gap-3">
          <span className="text-5xl font-medium tracking-tight">7.5%</span>
          <Gauge value={0.75} />
        </div>
        <ul className="mt-4 space-y-2 text-xs text-muted">
          {[
            ["Face value", "$5,000"],
            ["PYT minted", "5,000"],
            ["Matures", "Oct 2028"],
          ].map(([k, v]) => (
            <li key={k} className="flex justify-between">
              <span>{k}</span>
              <span className="text-ink">{v}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="pl-6">
        <Tag tone="mint">Yield</Tag>
        <p className="mt-4 text-sm font-medium">Claimable now</p>
        <p className="mt-1 text-5xl font-medium tracking-tight">30.82</p>
        <p className="text-xs text-muted">PYT after 30 days</p>
        <div className="mt-4 flex items-center gap-3">
          <Donut value={0.62} />
          <span className="text-xs text-muted">62% of this month&apos;s target</span>
        </div>
      </div>
    </div>
  );
}

export function TokenizeCard() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex gap-1 rounded-full border border-line p-1 text-xs">
        {["Treasury bill", "Corporate bond", "Real estate"].map((t, i) => (
          <span key={t} className={`flex-1 rounded-full px-3 py-1.5 text-center ${i === 2 ? "bg-lilac-100 font-medium" : "text-muted"}`}>
            {t}
          </span>
        ))}
      </div>
      <div className="mt-5 space-y-3 text-sm">
        {[
          ["Issuer", "Manhattan REIT"],
          ["Face value", "$10,000"],
          ["Annual yield", "8.00%"],
          ["Maturity", "17 Oct 2028"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between border-b border-line pb-3">
            <span className="text-muted">{k}</span>
            <span className="font-medium">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-muted">Minted as ERC-721 token #3</span>
        <span className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-white">Mint asset</span>
      </div>
    </div>
  );
}

export function BridgeCard() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="rounded-lg border border-line p-4">
        <p className="text-xs text-muted">From Portaldot</p>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-3xl font-medium tracking-tight">1,200</span>
          <span className="text-sm font-medium">PYT</span>
        </div>
      </div>
      <div className="-my-3 flex justify-center">
        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white">
          <ArrowDown size={14} />
        </span>
      </div>
      <div className="rounded-lg border border-line p-4">
        <p className="text-xs text-muted">To Ethereum</p>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-3xl font-medium tracking-tight">1,200</span>
          <span className="text-sm font-medium">PYT</span>
        </div>
      </div>
      <ol className="mt-5 space-y-2 text-xs">
        {["Burned on Portaldot", "Relayer confirmed nonce 42", "Minted on destination"].map((s) => (
          <li key={s} className="flex items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-mint-100 text-gain">
              <Check size={10} strokeWidth={3} />
            </span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

const TXS = [
  ["Approve vault", "0x4594d8e9…bc263193"],
  ["Stake bond #2", "0x6794d1a7…6b08ee8"],
  ["Claim 30.82 PYT", "0x37d52347…ad00561d"],
  ["Unstake bond #2", "0x2d81c2cf…37fff43f"],
];

export function ProofCard() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Recent transactions</p>
        <Tag tone="mint">Local devnet run</Tag>
      </div>
      <ul className="mt-4 divide-y divide-line text-sm">
        {TXS.map(([label, hash]) => (
          <li key={hash} className="flex items-center justify-between py-3">
            <span>{label}</span>
            <code className="text-xs text-muted">{hash}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
