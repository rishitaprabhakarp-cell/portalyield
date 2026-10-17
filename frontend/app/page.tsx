"use client";

import { useState } from "react";
import { TrendingUp, Shield, Zap, Globe, ChevronRight, ArrowRight, Lock, Layers, Activity } from "lucide-react";

const MOCK_ASSETS = [
  {
    id: 1,
    type: "T-Bill",
    issuer: "US Treasury",
    faceValue: "$1,000",
    yield: "5.20%",
    maturity: "Oct 2027",
    status: "Active",
    pytEarned: "1,000 PYT",
    accruedYield: "14.2 PYT",
  },
  {
    id: 2,
    type: "Corporate Bond",
    issuer: "Apple Inc.",
    faceValue: "$5,000",
    yield: "7.50%",
    maturity: "Oct 2028",
    status: "Staked",
    pytEarned: "5,000 PYT",
    accruedYield: "71.0 PYT",
  },
  {
    id: 3,
    type: "Real Estate",
    issuer: "Manhattan REIT",
    faceValue: "$10,000",
    yield: "8.00%",
    maturity: "Oct 2028",
    status: "Active",
    pytEarned: "10,000 PYT",
    accruedYield: "152.0 PYT",
  },
];

const VAULT_STATS = {
  totalTVL: "$16,000",
  totalPYT: "16,000 PYT",
  totalYieldPaid: "237.2 PYT",
  activeAssets: 3,
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"assets" | "vault" | "bridge">("assets");
  const [connected, setConnected] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>

      {/* Navigation */}
      <nav className="glass border-b border-portal-900/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-portal-500 to-yield-green flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Portal<span className="text-portal-400">Yield</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <button onClick={() => setActiveTab("assets")} className={`hover:text-white transition-colors ${activeTab === "assets" ? "text-portal-400" : ""}`}>Assets</button>
            <button onClick={() => setActiveTab("vault")} className={`hover:text-white transition-colors ${activeTab === "vault" ? "text-portal-400" : ""}`}>Vault</button>
            <button onClick={() => setActiveTab("bridge")} className={`hover:text-white transition-colors ${activeTab === "bridge" ? "text-portal-400" : ""}`}>Bridge</button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-yield-green bg-yield-green/10 px-3 py-1.5 rounded-full border border-yield-green/20">
              <div className="w-1.5 h-1.5 rounded-full bg-yield-green animate-pulse" />
              Portaldot Testnet
            </div>
            <button
              onClick={() => setConnected(!connected)}
              className="bg-portal-600 hover:bg-portal-500 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {connected ? "0x1a2b...3c4d" : "Connect Wallet"}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs text-portal-400 bg-portal-950/60 border border-portal-800/40 px-4 py-2 rounded-full mb-8">
            <Zap size={12} />
            Built on Portaldot Network V3.0 · EVM Compatible
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-none tracking-tight">
            Real World Assets,<br />
            <span className="gradient-text">on-chain yield.</span>
          </h1>

          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Tokenize T-Bills, bonds, and real estate as NFTs. Stake them to earn PYT yield tokens.
            Bridge across chains via Portaldot's multi-chain infrastructure.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => { setConnected(true); setActiveTab("vault"); }}
              className="flex items-center gap-2 bg-portal-600 hover:bg-portal-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all hover:scale-105"
            >
              Launch App <ArrowRight size={18} />
            </button>
            <a
              href="https://github.com/YOUR_USERNAME/portaldot_hack"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-portal-700/50 hover:border-portal-500 text-gray-300 hover:text-white px-8 py-3.5 rounded-xl font-semibold transition-all"
            >
              View Code <ChevronRight size={18} />
            </a>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Total Value Locked", value: VAULT_STATS.totalTVL, icon: <Lock size={16} /> },
            { label: "PYT in Circulation", value: VAULT_STATS.totalPYT, icon: <Activity size={16} /> },
            { label: "Yield Distributed", value: VAULT_STATS.totalYieldPaid, icon: <TrendingUp size={16} /> },
            { label: "RWA Assets", value: VAULT_STATS.activeAssets, icon: <Layers size={16} /> },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 text-portal-400 mb-3 text-sm">
                {stat.icon}
                <span>{stat.label}</span>
              </div>
              <div className="text-2xl font-bold stat-glow">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <div className="flex gap-2 mb-6">
          {(["assets", "vault", "bridge"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? "bg-portal-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Assets Tab */}
        {activeTab === "assets" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-200">Available RWA Assets</h2>
              <span className="text-sm text-gray-400">Demo data — connect wallet for live Portaldot testnet</span>
            </div>

            {MOCK_ASSETS.map((asset) => (
              <div key={asset.id} className="glass rounded-2xl p-6 hover:border-portal-700/40 transition-all pulse-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                      asset.type === "T-Bill" ? "bg-yield-green/20 text-yield-green" :
                      asset.type === "Corporate Bond" ? "bg-portal-500/20 text-portal-400" :
                      "bg-yield-gold/20 text-yield-gold"
                    }`}>
                      {asset.type === "T-Bill" ? "T" : asset.type === "Corporate Bond" ? "B" : "RE"}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-100">#{asset.id} {asset.type}</div>
                      <div className="text-sm text-gray-400">{asset.issuer}</div>
                    </div>
                  </div>

                  <div className={`text-xs px-3 py-1 rounded-full border ${
                    asset.status === "Staked"
                      ? "bg-portal-500/10 text-portal-400 border-portal-500/20"
                      : "bg-yield-green/10 text-yield-green border-yield-green/20"
                  }`}>
                    {asset.status}
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-6 pt-4 border-t border-white/5">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Face Value</div>
                    <div className="font-mono font-medium">{asset.faceValue}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">APY</div>
                    <div className="font-mono font-medium text-yield-green">{asset.yield}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Maturity</div>
                    <div className="font-mono font-medium">{asset.maturity}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">PYT Minted</div>
                    <div className="font-mono font-medium text-portal-400">{asset.pytEarned}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Accrued Yield</div>
                    <div className="font-mono font-medium text-yield-gold">{asset.accruedYield}</div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  {asset.status === "Active" ? (
                    <button
                      onClick={() => setActiveTab("vault")}
                      className="flex-1 bg-portal-600/20 hover:bg-portal-600/40 border border-portal-600/30 text-portal-300 py-2.5 rounded-xl text-sm font-medium transition-all"
                    >
                      Stake in Vault →
                    </button>
                  ) : (
                    <>
                      <button className="flex-1 bg-yield-green/10 hover:bg-yield-green/20 border border-yield-green/20 text-yield-green py-2.5 rounded-xl text-sm font-medium transition-all">
                        Claim {asset.accruedYield}
                      </button>
                      <button className="px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 py-2.5 rounded-xl text-sm font-medium transition-all">
                        Unstake
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vault Tab */}
        {activeTab === "vault" && (
          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-2">PortalYield Vault</h2>
            <p className="text-gray-400 text-sm mb-8">
              Stake your RWA NFTs to mint PYT tokens and earn continuous yield on Portaldot Network V3.0.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-portal-950/60 border border-portal-800/30 rounded-xl p-6">
                <h3 className="font-medium mb-4 text-gray-200">How Staking Works</h3>
                {[
                  ["1", "Mint RWA NFT", "Whitelisted issuers tokenize real-world assets as ERC-721 NFTs"],
                  ["2", "Approve Vault", "Approve the PortalYieldVault contract to transfer your NFT"],
                  ["3", "Stake → Receive PYT", "Lock your NFT, instantly receive PYT proportional to face value"],
                  ["4", "Claim Yield", "Yield accrues continuously — claim PYT anytime"],
                ].map(([num, title, desc]) => (
                  <div key={num} className="flex gap-4 mb-4 last:mb-0">
                    <div className="w-7 h-7 rounded-lg bg-portal-600/30 text-portal-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{num}</div>
                    <div>
                      <div className="font-medium text-sm text-gray-200">{title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-portal-950/60 border border-portal-800/30 rounded-xl p-6">
                <h3 className="font-medium mb-4 text-gray-200">Yield Formula</h3>
                <div className="font-mono text-xs bg-black/40 rounded-lg p-4 text-gray-300 leading-relaxed">
                  <div className="text-portal-400 mb-2">// PYT minting ratio</div>
                  <div>1 USD cent = 1e16 PYT wei</div>
                  <div className="mt-3 text-portal-400">// Daily yield accrual</div>
                  <div>yield = (PYT × APY_BPS × elapsed)</div>
                  <div className="pl-8">/ (10000 × 365 days)</div>
                  <div className="mt-3 text-gray-500">// Example: $1,000 T-Bill @ 5.2%</div>
                  <div className="text-yield-green">→ 1,000 PYT + ~52 PYT/year</div>
                </div>
              </div>
            </div>

            <div className="border border-portal-800/30 rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm mb-4">
                {connected
                  ? "Your staked positions will appear here. Connect to Portaldot testnet to interact."
                  : "Connect your wallet to Portaldot Testnet to start staking."}
              </p>
              <button
                onClick={() => setConnected(true)}
                className="bg-portal-600 hover:bg-portal-500 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              >
                {connected ? "View Positions on Portaldot Testnet" : "Connect Wallet"}
              </button>
            </div>
          </div>
        )}

        {/* Bridge Tab */}
        {activeTab === "bridge" && (
          <div className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-2">
              <Globe size={20} className="text-portal-400" />
              <h2 className="text-xl font-semibold">Cross-Chain PYT Bridge</h2>
            </div>
            <p className="text-gray-400 text-sm mb-8">
              Bridge PYT tokens between Portaldot Network and other EVM chains using Portaldot V3.0's multi-chain infrastructure.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Source Chain */}
              <div className="bg-portal-950/60 border border-portal-800/30 rounded-xl p-5">
                <div className="text-xs text-gray-500 mb-2">From</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-portal-600/30 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-portal-400" />
                  </div>
                  <span className="font-medium">Portaldot Testnet</span>
                  <span className="ml-auto text-xs text-yield-green bg-yield-green/10 px-2 py-1 rounded-full">Connected</span>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">PYT Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-portal-500/50"
                  />
                  <div className="text-xs text-gray-500 mt-2">Balance: 5,237.2 PYT</div>
                </div>
              </div>

              {/* Destination Chain */}
              <div className="bg-portal-950/60 border border-portal-800/30 rounded-xl p-5">
                <div className="text-xs text-gray-500 mb-2">To</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-600/30 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                  </div>
                  <select className="bg-transparent font-medium focus:outline-none text-gray-200">
                    <option>Ethereum Mainnet</option>
                    <option>Polygon</option>
                    <option>BNB Chain</option>
                    <option>Arbitrum</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Recipient Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-portal-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="bg-portal-950/40 border border-portal-800/20 rounded-xl p-4 mb-6 text-sm">
              <div className="flex justify-between text-gray-400 mb-2">
                <span>Bridge fee</span><span className="text-gray-200">~0.001 POT</span>
              </div>
              <div className="flex justify-between text-gray-400 mb-2">
                <span>Estimated time</span><span className="text-gray-200">~2 minutes</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Powered by</span><span className="text-portal-400">Portaldot Cross-Chain Messaging</span>
              </div>
            </div>

            <button className="w-full bg-portal-600 hover:bg-portal-500 text-white py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.01] flex items-center justify-center gap-2">
              Bridge PYT Tokens <ArrowRight size={20} />
            </button>

            <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-xs text-yellow-400/80">
              <strong>Portaldot V3.0 Integration:</strong> The CrossChainBridge contract locks PYT on Portaldot and emits events that trusted relayers monitor. Relayers call bridgeIn() on destination chains to mint equivalent PYT. In production, this integrates with Portaldot's native XCM/IBC messaging layer.
            </div>
          </div>
        )}

        {/* Portaldot V3.0 Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {[
            { icon: <Shield size={18} />, title: "EVM Compatible", desc: "Full Solidity/Solidity contract support on Portaldot V3.0" },
            { icon: <Layers size={18} />, title: "WASM Ready", desc: "Modular architecture — ink! WASM contracts supported natively" },
            { icon: <Globe size={18} />, title: "Multi-Chain", desc: "Cross-chain PYT bridging via Portaldot's native infra" },
            { icon: <Zap size={18} />, title: "ERC-20 & ERC-721", desc: "Both token standards fully operational on Portaldot" },
          ].map((feat) => (
            <div key={feat.title} className="glass rounded-xl p-5">
              <div className="text-portal-400 mb-3">{feat.icon}</div>
              <div className="font-semibold text-sm mb-1">{feat.title}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{feat.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-portal-900/30 mt-20 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-500 text-sm">
            PortalYield — Portaldot Network Hacker House 2026
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="https://github.com/YOUR_USERNAME/portaldot_hack" className="hover:text-gray-300">GitHub</a>
            <a href="https://discord.gg/portaldot" className="hover:text-gray-300">Portaldot Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
