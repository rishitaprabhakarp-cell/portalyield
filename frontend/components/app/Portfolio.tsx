"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Address } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import { abis, ASSET_TYPES, DEMO_ASSETS, home, HOME_CHAIN_ID, homeChain, IS_LOCAL } from "@/lib/contracts";
import { useTx } from "./activity";
import { Button, fmtDate, fmtPyt, fmtUsdCents, Panel, Stat } from "./ui";
import { useChainNow } from "./useChainNow";

const YEAR = 365n * 24n * 60n * 60n;

type AssetData = {
  assetType: number;
  issuer: string;
  faceValue: bigint;
  maturityDate: bigint;
  annualYieldBPS: bigint;
  isActive: boolean;
};

type Position = {
  tokenId: bigint;
  faceValue: bigint;
  annualYieldBPS: bigint;
  pytMinted: bigint;
  lastClaimAt: bigint;
  maturityDate: bigint;
  pendingYield: bigint;
};

function accrued(p: Position, now: number) {
  const end = BigInt(now) < p.maturityDate ? BigInt(now) : p.maturityDate;
  if (end <= p.lastClaimAt) return 0n;
  return (p.pytMinted * p.annualYieldBPS * (end - p.lastClaimAt)) / (10000n * YEAR);
}

const pct = (bps: bigint) => `${(Number(bps) / 100).toFixed(2)}%`;

export default function Portfolio({ account }: { account: Address }) {
  const chainId = HOME_CHAIN_ID;
  const c = home!;
  const { send, busy } = useTx();
  const now = useChainNow(chainId);

  const read = { chainId, query: { refetchInterval: 4000 } } as const;
  const { data: pytBalance } = useReadContract({ ...read, address: c.YieldToken, abi: abis.pyt, functionName: "balanceOf", args: [account] });
  const { data: ownedIds } = useReadContract({ ...read, address: c.RWAAsset, abi: abis.rwa, functionName: "tokensOfOwner", args: [account] });
  const { data: positionsRaw } = useReadContract({ ...read, address: c.PortalYieldVault, abi: abis.vault, functionName: "getPositions", args: [account] });
  const { data: approved } = useReadContract({ ...read, address: c.RWAAsset, abi: abis.rwa, functionName: "isApprovedForAll", args: [account, c.PortalYieldVault] });
  const { data: demoState } = useReadContracts({
    contracts: [
      { chainId, address: c.RWAAsset, abi: abis.rwa, functionName: "demoMode" },
      ...DEMO_ASSETS.map((d) => ({ chainId, address: c.RWAAsset, abi: abis.rwa, functionName: "demoClaimed", args: [account, d.kind] })),
    ],
  });

  const owned = (ownedIds as bigint[] | undefined) ?? [];
  const positions = (positionsRaw as Position[] | undefined) ?? [];
  const ids = [...owned, ...positions.map((p) => p.tokenId)];
  const { data: assetResults } = useReadContracts({
    contracts: ids.map((id) => ({ chainId, address: c.RWAAsset, abi: abis.rwa, functionName: "getAssetData", args: [id] })),
    query: { enabled: ids.length > 0 },
  });
  const assets = new Map<bigint, AssetData>();
  ids.forEach((id, i) => {
    const r = assetResults?.[i];
    if (r?.status === "success") assets.set(id, r.result as AssetData);
  });

  const demoMode = demoState?.[0]?.result === true;
  const demoClaimed = DEMO_ASSETS.map((_, i) => demoState?.[i + 1]?.result === true);

  const stakedFace = positions.reduce((sum, p) => sum + p.faceValue, 0n);
  const claimable = positions.reduce((sum, p) => sum + accrued(p, now), 0n);
  const balance = (pytBalance as bigint | undefined) ?? 0n;

  const tx = (label: string, address: Address, abi: typeof abis.rwa, functionName: string, args: readonly unknown[]) =>
    send({ label, chainId, address, abi, functionName, args });

  async function stake(id: bigint) {
    if (!approved) {
      const ok = await tx("Approve vault for your assets", c.RWAAsset, abis.rwa, "setApprovalForAll", [c.PortalYieldVault, true]);
      if (!ok) return;
    }
    await tx(`Stake asset #${id}`, c.PortalYieldVault, abis.vault, "stake", [id]);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="PYT balance" value={fmtPyt(balance)} />
        <Stat label="Staked face value" value={fmtUsdCents(stakedFace)} />
        <Stat label="Claimable yield" value={`${fmtPyt(claimable, 4)} PYT`} tone="gain" />
        <Stat label="Assets in wallet" value={String(owned.length)} />
      </div>

      {IS_LOCAL && <TimeTravel now={now} />}

      <Panel title="Staked positions">
        {positions.length === 0 ? (
          <p className="text-sm text-muted">Nothing staked yet. Stake an asset from your wallet below to start earning.</p>
        ) : (
          <ul className="divide-y divide-line">
            {positions.map((p) => {
              const a = assets.get(p.tokenId);
              const pending = accrued(p, now);
              const matured = BigInt(now) >= p.maturityDate;
              const canUnstake = balance >= p.pytMinted;
              return (
                <li key={String(p.tokenId)} className="grid gap-4 py-4 first:pt-0 last:pb-0 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center">
                  <div>
                    <p className="font-medium">{a?.issuer ?? `Asset #${p.tokenId}`}</p>
                    <p className="text-sm text-muted">
                      {a ? ASSET_TYPES[a.assetType] : ""} #{String(p.tokenId)}, {pct(p.annualYieldBPS)} APY
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Principal</p>
                    <p className="tabular-nums">{fmtPyt(p.pytMinted, 0)} PYT</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">{matured ? "Matured, final yield" : "Earning now"}</p>
                    <p className="tabular-nums text-gain">+{fmtPyt(pending, 6)} PYT</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="lilac"
                      disabled={!!busy || pending === 0n}
                      onClick={() => tx(`Claim yield on #${p.tokenId}`, c.PortalYieldVault, abis.vault, "claimYield", [p.tokenId])}
                    >
                      Claim yield
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={!!busy || !canUnstake}
                      title={canUnstake ? undefined : `Unstaking burns ${fmtPyt(p.pytMinted, 0)} PYT; bridge some back first`}
                      onClick={() => tx(`Unstake asset #${p.tokenId}`, c.PortalYieldVault, abis.vault, "unstake", [p.tokenId])}
                    >
                      Unstake
                    </Button>
                  </div>
                  {!canUnstake && (
                    <p className="text-xs text-muted md:col-span-4">
                      Unstaking burns the {fmtPyt(p.pytMinted, 0)} PYT you received. You hold {fmtPyt(balance)} on {homeChain.name}.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel title="In your wallet">
        {owned.length === 0 ? (
          <p className="text-sm text-muted">
            {demoMode ? "No assets yet. Claim a demo asset below to try the full flow." : "No tokenized assets in this wallet."}
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {owned.map((id) => {
              const a = assets.get(id);
              return (
                <li key={String(id)} className="rounded-xl bg-mint-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{a?.issuer ?? `Asset #${id}`}</p>
                      <p className="text-sm text-muted">{a ? ASSET_TYPES[a.assetType] : "Loading"} #{String(id)}</p>
                    </div>
                    <Button size="sm" disabled={!!busy || !a?.isActive} onClick={() => stake(id)}>
                      {approved ? "Stake" : "Approve and stake"}
                    </Button>
                  </div>
                  {a && (
                    <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <dt className="text-xs text-muted">Face value</dt>
                        <dd className="tabular-nums">{fmtUsdCents(a.faceValue)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">APY</dt>
                        <dd className="tabular-nums">{pct(a.annualYieldBPS)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">Matures</dt>
                        <dd>{fmtDate(a.maturityDate)}</dd>
                      </div>
                    </dl>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {demoMode && (
        <Panel title="Demo assets">
          <p className="-mt-2 mb-4 text-sm text-muted">
            Testnet only. Each wallet can claim one of each sample asset to try minting, staking and yield.
          </p>
          <ul className="grid gap-3 md:grid-cols-3">
            {DEMO_ASSETS.map((d, i) => (
              <li key={d.kind} className="flex flex-col justify-between gap-4 rounded-xl ring-1 ring-line p-5">
                <div>
                  <p className="font-medium">{d.label}</p>
                  <p className="mt-1 text-sm text-muted">
                    ${d.face.toLocaleString()} face value, {d.apy}% APY, {d.term}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="lilac"
                  disabled={!!busy || demoClaimed[i]}
                  onClick={() => tx(`Claim demo ${d.label}`, c.RWAAsset, abis.rwa, "claimDemoAsset", [d.kind])}
                >
                  {demoClaimed[i] ? "Claimed" : "Claim asset"}
                </Button>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

function TimeTravel({ now }: { now: number }) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  async function advance(days: number) {
    setPending(true);
    const rpc = homeChain.rpcUrls.default.http[0];
    const call = (method: string, params: unknown[]) =>
      fetch(rpc, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
    await call("evm_increaseTime", [days * 86400]);
    await call("evm_mine", []);
    await queryClient.invalidateQueries();
    setPending(false);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lilac-50 px-5 py-3 text-sm">
      <span>
        Local chain time: <span className="font-medium">{fmtDate(now)}</span>. Skip ahead to see yield accrue.
      </span>
      <div className="flex gap-2">
        {[1, 30, 180].map((d) => (
          <Button key={d} size="sm" variant="ghost" disabled={pending} onClick={() => advance(d)}>
            +{d} {d === 1 ? "day" : "days"}
          </Button>
        ))}
      </div>
    </div>
  );
}
