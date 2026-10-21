"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { chains, explorerTx, home, homeChain, IS_LOCAL } from "@/lib/contracts";
import { useActivity } from "./activity";
import Bridge from "./Bridge";
import Portfolio from "./Portfolio";
import { Button, shortHex } from "./ui";

const TABS = ["Portfolio", "Bridge"] as const;

export default function AppShell() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Portfolio");
  const { address, chainId, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  useEffect(() => setMounted(true), []);
  const onSupportedChain = chains.some((c) => c.id === chainId);
  const activeChain = chains.find((c) => c.id === chainId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-100 via-lilac-50 to-white">
      <header className="sticky top-0 z-40 bg-mint-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
              <circle cx="8" cy="11" r="7" fill="#cbb4ff" />
              <circle cx="14" cy="11" r="7" fill="#79e0cc" fillOpacity="0.85" />
            </svg>
            PortalYield
          </Link>
          {mounted && isConnected && address && (
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-white px-3 py-2 text-xs sm:inline">
                {activeChain?.name ?? "Unsupported network"}
              </span>
              <span className="rounded-full bg-white px-3 py-2 font-mono text-xs">{shortHex(address)}</span>
              <Button size="sm" variant="ghost" onClick={() => disconnect()}>
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
        {!mounted ? null : !home ? (
          <Notice title="Contracts aren't deployed for this network">
            Run <code>npm run deploy:local</code> in the project root, then reload.
          </Notice>
        ) : !isConnected || !address ? (
          <Connect />
        ) : !onSupportedChain ? (
          <Notice title={`Switch to ${homeChain.name}`}>
            <Button className="mt-4" onClick={() => switchChain({ chainId: homeChain.id })}>
              Switch network
            </Button>
          </Notice>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h1 className="text-4xl font-semibold tracking-display">Your yield</h1>
              <div className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-line" role="tablist">
                {TABS.map((t) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => setTab(t)}
                    className={`rounded-full px-5 py-2 text-sm font-medium ${tab === t ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_300px]">
              <div>{tab === "Portfolio" ? <Portfolio account={address} /> : <Bridge account={address} />}</div>
              <Activity />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Connect() {
  const { connectors, connect, isPending, error } = useConnect();
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center ring-1 ring-line">
      <h1 className="text-3xl font-semibold tracking-display">Connect a wallet</h1>
      <p className="mt-3 text-muted">
        {IS_LOCAL
          ? "Use the local dev account to try everything without an extension, or connect MetaMask pointed at the local chain."
          : `Connect a wallet on ${homeChain.name} to claim, stake and bridge.`}
      </p>
      <div className="mt-6 flex flex-col gap-2">
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            variant={connector.type === "mock" ? "dark" : "ghost"}
            disabled={isPending}
            onClick={() => connect({ connector, chainId: homeChain.id })}
          >
            {connector.type === "mock" ? "Use local dev account" : `Connect ${connector.name}`}
          </Button>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-red-700">{error.message.split("\n")[0]}</p>}
    </div>
  );
}

function Activity() {
  const entries = useActivity();
  return (
    <aside className="h-fit rounded-2xl bg-white p-6 ring-1 ring-line xl:sticky xl:top-24">
      <h2 className="text-lg font-medium tracking-tight">Activity</h2>
      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Transactions from this session appear here.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {entries.map((e) => {
            const link = e.hash ? explorerTx(e.chainId, e.hash) : undefined;
            return (
              <li key={e.id} className="text-sm">
                <div className="flex items-start justify-between gap-2">
                  <span>{e.label}</span>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                      e.status === "confirmed" ? "bg-mint-100 text-gain" : e.status === "failed" ? "bg-red-50 text-red-700" : "bg-lilac-100 text-lilac-500"
                    }`}
                  >
                    {e.status === "confirmed" ? "Confirmed" : e.status === "failed" ? "Failed" : "Pending"}
                  </span>
                </div>
                {e.hash &&
                  (link ? (
                    <a href={link} target="_blank" rel="noreferrer" className="font-mono text-xs text-muted underline">
                      {shortHex(e.hash, 10, 8)}
                    </a>
                  ) : (
                    <code className="text-xs text-muted">{shortHex(e.hash, 10, 8)}</code>
                  ))}
                {e.error && <p className="mt-1 text-xs text-red-700">{e.error}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center ring-1 ring-line">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-3 text-muted">{children}</div>
    </div>
  );
}
