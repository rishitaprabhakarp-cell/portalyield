"use client";

import { useState } from "react";
import { isAddress, parseEther, parseEventLogs, type Address } from "viem";
import { useReadContract } from "wagmi";
import { abis, contractsOn, homeChain, remoteChain } from "@/lib/contracts";
import { useTx } from "./activity";
import { Button, fmtPyt, Panel } from "./ui";

type Transfer = { sourceChainId: number; destChainId: number; nonce: bigint; amount: bigint };

function usePytBalance(chainId: number, account: Address) {
  const token = contractsOn(chainId)?.YieldToken;
  const { data } = useReadContract({
    chainId,
    address: token,
    abi: abis.pyt,
    functionName: "balanceOf",
    args: [account],
    query: { enabled: !!token, refetchInterval: 3000 },
  });
  return data as bigint | undefined;
}

export default function Bridge({ account }: { account: Address }) {
  const [toRemote, setToRemote] = useState(true);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState<string>(account);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const { send, busy } = useTx();

  const source = toRemote ? homeChain : remoteChain;
  const dest = toRemote ? remoteChain : homeChain;
  const sourceBridge = contractsOn(source.id)?.CrossChainBridge;
  const balances = { [homeChain.id]: usePytBalance(homeChain.id, account), [remoteChain.id]: usePytBalance(remoteChain.id, account) };
  const sourceBalance = balances[source.id];

  let amountWei: bigint | null = null;
  try {
    amountWei = amount ? parseEther(amount) : null;
  } catch {
    amountWei = null;
  }
  const problem = !sourceBridge
    ? `No bridge deployed on ${source.name}.`
    : amount && amountWei === null
      ? "Enter a valid amount."
      : amountWei !== null && sourceBalance !== undefined && amountWei > sourceBalance
        ? `You only have ${fmtPyt(sourceBalance)} PYT on ${source.name}.`
        : recipient && !isAddress(recipient)
          ? "Recipient must be a 0x address."
          : null;

  async function submit() {
    if (!amountWei || !sourceBridge || problem) return;
    const receipt = await send({
      label: `Bridge ${amount} PYT to ${dest.name}`,
      chainId: source.id,
      address: sourceBridge,
      abi: abis.bridge,
      functionName: "bridgeOut",
      args: [BigInt(dest.id), recipient as Address, amountWei],
    });
    if (!receipt) return;
    const [event] = parseEventLogs({ abi: abis.bridge, logs: receipt.logs, eventName: "BridgeOutInitiated" });
    const nonce = (event as unknown as { args: { nonce: bigint } } | undefined)?.args.nonce;
    if (nonce !== undefined) setTransfers((t) => [{ sourceChainId: source.id, destChainId: dest.id, nonce, amount: amountWei! }, ...t]);
    setAmount("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <Panel title="Bridge PYT">
        <div className="rounded-xl ring-1 ring-line p-4">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>From {source.name}</span>
            <button
              type="button"
              className="underline-offset-2 hover:underline"
              disabled={sourceBalance === undefined}
              onClick={() => sourceBalance !== undefined && setAmount(fmtPyt(sourceBalance, 6).replace(/,/g, ""))}
            >
              Balance {fmtPyt(sourceBalance)}
            </button>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <label htmlFor="bridge-amount" className="sr-only">Amount</label>
            <input
              id="bridge-amount"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.trim())}
              className="min-w-0 flex-1 bg-transparent text-4xl font-medium tracking-tight outline-none placeholder:text-line"
            />
            <span className="font-medium">PYT</span>
          </div>
        </div>

        <div className="-my-3 flex justify-center">
          <button
            type="button"
            aria-label="Swap direction"
            onClick={() => setToRemote((v) => !v)}
            className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-line hover:bg-mint-50"
          >
            ↓
          </button>
        </div>

        <div className="rounded-xl ring-1 ring-line p-4">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>To {dest.name}</span>
            <span>Balance {fmtPyt(balances[dest.id])}</span>
          </div>
          <label htmlFor="bridge-recipient" className="mt-3 block text-xs text-muted">Recipient</label>
          <input
            id="bridge-recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value.trim())}
            className="mt-1 w-full rounded-lg bg-mint-50 px-3 py-2 font-mono text-sm outline-none"
          />
        </div>

        {problem && <p className="mt-4 text-sm text-red-700">{problem}</p>}
        <Button className="mt-5 w-full" disabled={!!busy || !amountWei || !!problem} onClick={submit}>
          {busy?.startsWith("Bridge") ? "Bridging…" : `Bridge to ${dest.name}`}
        </Button>
        <p className="mt-3 text-xs text-muted">
          PYT is burned on {source.name} and minted on {dest.name} once the relayer confirms the transfer.
        </p>
      </Panel>

      <Panel title="Transfers">
        {transfers.length === 0 ? (
          <p className="text-sm text-muted">Transfers you start here show their delivery status.</p>
        ) : (
          <ul className="space-y-3">
            {transfers.map((t) => (
              <TransferRow key={`${t.sourceChainId}-${t.nonce}`} transfer={t} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function TransferRow({ transfer }: { transfer: Transfer }) {
  const destBridge = contractsOn(transfer.destChainId)?.CrossChainBridge;
  const { data: delivered } = useReadContract({
    chainId: transfer.destChainId,
    address: destBridge,
    abi: abis.bridge,
    functionName: "processedInbound",
    args: [BigInt(transfer.sourceChainId), transfer.nonce],
    query: { enabled: !!destBridge, refetchInterval: (q) => (q.state.data ? false : 1500) },
  });
  const destName = transfer.destChainId === homeChain.id ? homeChain.name : remoteChain.name;

  return (
    <li className="flex items-center justify-between rounded-xl bg-mint-50 px-4 py-3 text-sm">
      <div>
        <p className="font-medium tabular-nums">{fmtPyt(transfer.amount)} PYT</p>
        <p className="text-xs text-muted">
          To {destName}, transfer #{String(transfer.nonce)}
        </p>
      </div>
      <span className={`rounded px-2 py-1 text-xs font-medium ${delivered ? "bg-mint-200 text-gain" : "bg-lilac-100 text-lilac-500"}`}>
        {delivered ? "Delivered" : "Waiting for relayer"}
      </span>
    </li>
  );
}
