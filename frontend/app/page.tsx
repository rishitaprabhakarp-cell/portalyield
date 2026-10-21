import { Landmark, Coins, ShieldCheck } from "lucide-react";
import YieldBars from "@/components/YieldBars";
import YieldEstimator from "@/components/YieldEstimator";
import { BridgeCard, PositionCard, ProofCard, TokenizeCard } from "@/components/ProductCards";

const GITHUB_URL = "https://github.com/YOUR_USERNAME/portaldot_hack";

function Logo() {
  return (
    <a href="#" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <circle cx="8" cy="11" r="7" fill="#cbb4ff" />
        <circle cx="14" cy="11" r="7" fill="#79e0cc" fillOpacity="0.85" />
      </svg>
      PortalYield
    </a>
  );
}

const PILLARS = [
  {
    icon: Landmark,
    title: "Real assets, real rates",
    body: "Treasury bills, corporate bonds and real estate, each minted with its face value, yield and maturity on Portaldot.",
  },
  {
    icon: Coins,
    title: "Liquid from day one",
    body: "Staking an asset mints PYT, an ERC-20 you can hold, trade or bridge while the asset keeps earning.",
  },
  {
    icon: ShieldCheck,
    title: "Yield you can check",
    body: "Accrual is computed by the vault contract every second. No spreadsheets, no monthly statements.",
  },
];

const FEATURES = [
  {
    title: "Tokenize an asset in one transaction",
    bullets: [
      "Approved issuers mint each asset as an ERC-721 token with its terms stored onchain",
      "Face value, annual yield and maturity date can't be edited after minting",
      "Matured or retired assets are marked inactive and stop earning",
    ],
    card: <TokenizeCard />,
    panel: "from-mint-100 to-lilac-50",
  },
  {
    title: "Stake it and earn every second",
    bullets: [
      "Deposit an asset into the vault and receive 1 PYT for every dollar of face value",
      "Yield accrues continuously at the asset's fixed rate",
      "Claim whenever you like, or unstake to get the asset back",
    ],
    card: <PositionCard />,
    panel: "from-lilac-50 to-mint-100",
  },
  {
    title: "Move PYT to other chains",
    bullets: [
      "Bridge PYT from Portaldot to Ethereum and other EVM networks",
      "Every transfer carries a nonce, so a message can't be replayed",
      "Only trusted relayers can complete a transfer on the destination chain",
    ],
    card: <BridgeCard />,
    panel: "from-mint-100 to-mint-50",
  },
  {
    title: "Every step leaves a receipt",
    bullets: [
      "Minting, staking, claiming and bridging all emit onchain events",
      "Look up any position by transaction hash on the Portaldot explorer",
      "Contracts are open source and covered by 15 automated tests",
    ],
    card: <ProofCard />,
    panel: "from-lilac-50 to-lilac-100",
  },
];

const STATS = [
  ["3", "asset classes supported at launch: treasuries, bonds and real estate"],
  ["5.2–8%", "fixed annual yield across the demo assets"],
  ["15/15", "contract tests passing for minting, staking, yield and bridging"],
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-40 bg-mint-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Logo />
          <a href="#estimate" className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink/85">
            Launch app
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-mint-100 via-lilac-50 to-lilac-100 pt-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-display sm:text-[64px]">
            Earn on real-world assets, onchain
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink/80">
            Tokenize treasuries, bonds and real estate on Portaldot. Stake them, receive PYT, and collect yield you can verify.
          </p>
          <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-white/70 p-1.5 ring-1 ring-white">
            <a href="#estimate" className="rounded-full bg-lilac-300 px-6 py-3 text-sm font-medium hover:bg-lilac-300/80">
              Estimate your yield
            </a>
            <a href={GITHUB_URL} className="rounded-full px-6 py-3 text-sm font-medium hover:bg-white">
              Read the contracts
            </a>
          </div>
          <p className="mt-3 text-xs text-muted">ERC-20 and ERC-721 contracts on Portaldot V3.0&apos;s EVM layer</p>
        </div>

        <div id="estimate" className="relative z-10 mx-auto mt-14 max-w-3xl scroll-mt-24 px-6">
          <div className="rounded-3xl bg-white/50 p-2 ring-1 ring-white">
            <YieldEstimator />
          </div>
        </div>

        <YieldBars className="relative -mt-20" />
      </section>

      <section className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-10 gap-y-4 px-6 py-8 text-sm text-muted">
          <span>Built with</span>
          {["Portaldot V3.0", "Solidity 0.8.26", "OpenZeppelin 5", "ERC-20", "ERC-721", "Hardhat"].map((t) => (
            <span key={t} className="text-base font-semibold text-ink">{t}</span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-xl text-3xl font-medium uppercase leading-tight tracking-tight sm:text-4xl">
          The yield layer for Portaldot
        </h2>
        <p className="mt-4 text-lg text-ink/80">Bring off-chain income onchain without giving up liquidity.</p>
        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-md bg-mint-100 p-6">
              <Icon size={24} strokeWidth={1.75} />
              <h3 className="mt-10 text-xl font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mx-auto max-w-3xl text-center text-4xl font-medium leading-[1.05] tracking-display sm:text-[56px]">
          Treasuries: onchain. Bonds: onchain. Yield: yours.
        </h2>

        <div className="mt-20 space-y-28">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="grid items-center gap-12 md:grid-cols-2">
              <div className={i % 2 ? "md:order-2" : ""}>
                <h3 className="text-3xl font-medium leading-tight tracking-tight">{f.title}</h3>
                <ul className="mt-6 list-disc space-y-3 pl-5 text-ink/85 marker:text-ink">
                  {f.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
              <div className={`rounded-sm bg-gradient-to-b ${f.panel} px-8 py-12 sm:px-12`}>
                <div className="rounded-xl bg-white/60 p-2 ring-1 ring-white">{f.card}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center text-4xl font-medium tracking-display">Built to be checked, not trusted</h2>
        <div className="mt-12 grid gap-10 border-t border-line pt-10 md:grid-cols-3">
          {STATS.map(([n, label]) => (
            <div key={n}>
              <p className="text-6xl font-medium tracking-display">{n}</p>
              <p className="mt-3 max-w-xs text-sm text-ink/80">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-b from-mint-100 to-lilac-100 pt-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-5xl font-semibold leading-[1.02] tracking-display">Your assets should earn while they wait</h2>
          <p className="mt-4 text-lg text-ink/80">
            Mint a demo asset on Portaldot testnet and watch its yield accrue.
          </p>
          <a href="#estimate" className="mt-8 inline-block rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-white hover:bg-ink/85">
            Launch app
          </a>
        </div>
        <YieldBars className="mt-16" />
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row">
        <Logo />
        <div className="flex gap-6">
          <a href={GITHUB_URL} className="hover:text-ink">GitHub</a>
          <a href="https://discord.gg/portaldot" className="hover:text-ink">Portaldot Discord</a>
        </div>
        <span>Built for the Portaldot Hacker House 2026</span>
      </footer>
    </>
  );
}
