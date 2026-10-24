import YieldBars from "@/components/YieldBars";
import YieldEstimator from "@/components/YieldEstimator";
import Guilloche from "@/components/Guilloche";
import AssetCertificate, { type Certificate } from "@/components/AssetCertificate";
import { BridgeCard, PositionCard, ProofCard, TokenizeCard } from "@/components/ProductCards";

const GITHUB_URL = "https://github.com/rishitaprabhakarp-cell/portalyield";

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#" className={`flex items-center gap-2 text-lg font-semibold tracking-tight ${light ? "text-white" : ""}`}>
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <circle cx="8" cy="11" r="7" fill="#cbb4ff" />
        <circle cx="14" cy="11" r="7" fill="#79e0cc" fillOpacity="0.85" />
      </svg>
      PortalYield
    </a>
  );
}

const CERTS: Certificate[] = [
  { tokenId: 1, kind: "Treasury bill", issuer: "US Treasury", faceValue: 1000, apyBps: 520, maturity: "Oct 2027", tone: "aqua" },
  { tokenId: 3, kind: "Real estate", issuer: "Manhattan REIT", faceValue: 10000, apyBps: 800, maturity: "Oct 2028", tone: "lilac" },
  { tokenId: 2, kind: "Corporate bond", issuer: "Apple Inc.", faceValue: 5000, apyBps: 750, maturity: "Oct 2028", tone: "mint" },
];

const STEPS = [
  {
    title: "Mint",
    body: "An approved issuer mints the asset as an ERC-721 token. Face value, rate and maturity are fixed at mint.",
    chip: "Bond #0002, $5,000 at 7.5%",
  },
  {
    title: "Stake",
    body: "Deposit the token in the vault and receive 1 PYT for every dollar of face value.",
    chip: "$5,000 bond, 5,000 PYT",
  },
  {
    title: "Earn",
    body: "Yield accrues every second until maturity. Claim it whenever you like, or unstake to get the asset back.",
    chip: "+1.03 PYT a day",
  },
  {
    title: "Bridge",
    body: "Burn PYT on Portaldot and a relayer mints it on Ethereum. Each transfer has a nonce, so it can't be replayed.",
    chip: "Portaldot to Ethereum",
  },
];

const STATS = [
  ["3", "asset classes at launch: treasuries, corporate bonds and real estate"],
  ["5.2–8%", "fixed annual yield across the demo assets"],
  ["22/22", "contract tests passing for minting, staking, yield and bridging"],
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
      "Contracts are open source and covered by 22 automated tests",
    ],
    card: <ProofCard />,
    panel: "from-lilac-50 to-lilac-100",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_85%_10%,#ece5ff_0%,#e3efea_45%,#f1f7f4_100%)]">
        <Guilloche
          size={900}
          lobes={16}
          strands={7}
          stroke="#0d3b33"
          strokeWidth={0.35}
          className="pointer-events-none absolute -right-[260px] top-1/2 hidden h-[900px] w-[900px] -translate-y-1/2 opacity-[0.1] md:block"
        />

        <header className="relative z-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Logo />
            <nav className="hidden items-center gap-8 text-sm text-ink/75 md:flex">
              <a href="#how" className="hover:text-ink">How it works</a>
              <a href="#estimate" className="hover:text-ink">Estimate</a>
              <a href={GITHUB_URL} className="hover:text-ink">Contracts</a>
            </nav>
            <a href="/app" className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink/85">
              Launch app
            </a>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-10 md:grid-cols-[1.05fr_1fr] md:pb-32 md:pt-16">
          <div>
            <h1 className="text-5xl font-semibold leading-[0.98] tracking-display sm:text-[72px]">
              Treasuries and bonds that pay you by the second
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/75">
              Tokenize a real-world asset on Portaldot, stake it in the vault and receive PYT. Yield accrues onchain at a fixed rate until maturity.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href="/app" className="rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-white hover:bg-ink/85">
                Launch app
              </a>
              <a href="#estimate" className="rounded-full bg-white/70 px-7 py-3.5 text-sm font-medium ring-1 ring-white hover:bg-white">
                Estimate your yield
              </a>
            </div>
          </div>

          <div className="relative mx-auto h-[380px] w-full max-w-[460px] sm:h-[540px]">
            <AssetCertificate
              cert={CERTS[0]}
              className="fan absolute left-0 top-2 hidden w-[380px] sm:block"
              style={{ transform: "translate(-40px, 20px) rotate(-10deg)", animationDelay: "60ms" }}
            />
            <AssetCertificate
              cert={CERTS[1]}
              className="fan absolute left-0 top-2 hidden w-[380px] sm:block"
              style={{ transform: "translate(70px, -10px) rotate(6deg)", animationDelay: "160ms" }}
            />
            <AssetCertificate
              cert={CERTS[2]}
              live={{ start: 30.8219 }}
              className="fan absolute inset-x-0 top-0 sm:top-16 mx-auto w-full max-w-[390px] sm:left-6 sm:right-auto sm:mx-0"
              style={{ animationDelay: "280ms" }}
            />
          </div>
        </div>
      </section>

      <section id="how" className="relative overflow-hidden bg-bond text-white scroll-mt-4">
        <Guilloche
          size={700}
          lobes={14}
          strands={7}
          stroke="#8fc4b6"
          strokeWidth={0.4}
          className="pointer-events-none absolute -left-60 -top-60 h-[700px] w-[700px] opacity-[0.12]"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <h2 className="max-w-2xl text-4xl font-medium leading-[1.05] tracking-display sm:text-[52px]">
            From a paper bond to onchain yield in four steps
          </h2>

          <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
            <span aria-hidden className="absolute left-0 right-0 top-[15px] hidden h-px bg-gradient-to-r from-aqua/70 via-lilac-300/70 to-aqua/10 md:block" />
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-bond text-sm font-semibold text-aqua ring-1 ring-aqua/60">
                  {i + 1}
                </span>
                <h3 className="mt-6 text-2xl font-medium">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{s.body}</p>
                <p className="mt-5 inline-block rounded-lg bg-white/[0.07] px-3 py-2 text-xs font-medium text-bond-300 ring-1 ring-white/10">
                  {s.chip}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-20 grid gap-10 border-t border-white/15 pt-10 md:grid-cols-3">
            {STATS.map(([n, label]) => (
              <div key={n}>
                <p className="font-serif text-7xl leading-none tracking-tight text-aqua">{n}</p>
                <p className="mt-3 max-w-xs text-sm text-white/70">{label}</p>
              </div>
            ))}
          </div>

          <p className="mt-16 text-sm text-white/55">
            Built with Portaldot V3.0, Solidity 0.8.26, OpenZeppelin 5, ERC-20, ERC-721 and Hardhat
          </p>
        </div>
      </section>

      <section id="estimate" className="scroll-mt-4 bg-gradient-to-b from-white to-lilac-50 pt-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-3xl bg-white p-2 shadow-[0_40px_80px_-40px_rgba(91,69,168,0.35)] ring-1 ring-line">
            <YieldEstimator />
          </div>
        </div>
        <YieldBars className="mt-16" />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-28">
        <h2 className="mx-auto max-w-3xl text-center text-4xl font-medium leading-[1.05] tracking-display sm:text-[56px]">
          Everything the asset does, you can see onchain
        </h2>

        <div className="mt-20 space-y-28">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="grid items-center gap-12 md:grid-cols-2">
              <div className={i % 2 ? "md:order-2" : ""}>
                <h3 className="text-3xl font-medium leading-tight tracking-tight">{f.title}</h3>
                <ul className="mt-6 space-y-4 text-ink/80">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lilac-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${f.panel} px-8 py-12 sm:px-12`}>
                <Guilloche
                  size={360}
                  stroke="#0d3b33"
                  strokeWidth={0.4}
                  className="pointer-events-none absolute -bottom-28 -right-28 h-[360px] w-[360px] opacity-[0.08]"
                />
                <div className="relative rounded-2xl bg-white/60 p-2 ring-1 ring-white">{f.card}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-b from-mint-100 to-lilac-100 pt-24">
        <Guilloche
          size={800}
          lobes={16}
          strands={7}
          stroke="#5b45a8"
          strokeWidth={0.35}
          className="pointer-events-none absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/3 opacity-[0.08]"
        />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-5xl font-semibold leading-[1.02] tracking-display">Your assets should earn while they wait</h2>
          <p className="mt-4 text-lg text-ink/75">
            Claim a demo bond, stake it and watch the yield accrue in your wallet.
          </p>
          <a href="/app" className="mt-8 inline-block rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-white hover:bg-ink/85">
            Launch app
          </a>
        </div>
        <YieldBars className="relative mt-16" />
      </section>

      <footer className="bg-bond">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-white/60 sm:flex-row">
          <Logo light />
          <div className="flex gap-6">
            <a href={GITHUB_URL} className="hover:text-white">GitHub</a>
            <a href="https://discord.gg/portaldot" className="hover:text-white">Portaldot Discord</a>
          </div>
          <span>Built for the Portaldot Hacker House 2026</span>
        </div>
      </footer>
    </>
  );
}
