"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useState } from "react";
import {
  BaseError,
  ContractFunctionRevertedError,
  type Abi,
  type Address,
  type Hash,
  type TransactionReceipt,
} from "viem";
import { useAccount, useConfig, useSwitchChain, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

export type ActivityEntry = {
  id: number;
  label: string;
  chainId: number;
  status: "pending" | "confirmed" | "failed";
  hash?: Hash;
  error?: string;
};

type ActivityContextValue = {
  entries: ActivityEntry[];
  upsert: (entry: ActivityEntry) => void;
};

const ActivityContext = createContext<ActivityContextValue | null>(null);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const upsert = useCallback((entry: ActivityEntry) => {
    setEntries((prev) => {
      const rest = prev.filter((e) => e.id !== entry.id);
      return [entry, ...rest].sort((a, b) => b.id - a.id);
    });
  }, []);
  return <ActivityContext.Provider value={{ entries, upsert }}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used inside ActivityProvider");
  return ctx.entries;
}

export function errorMessage(err: unknown): string {
  if (err instanceof BaseError) {
    const revert = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError && revert.reason) return revert.reason;
    return err.shortMessage;
  }
  return err instanceof Error ? err.message : String(err);
}

type TxRequest = {
  label: string;
  chainId: number;
  address: Address;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
};

let nextId = 1;

/** Sends a contract write, records it in the activity feed and refreshes reads once mined. */
export function useTx() {
  const ctx = useContext(ActivityContext)!;
  const config = useConfig();
  const queryClient = useQueryClient();
  const { chainId: walletChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState<string | null>(null);

  const send = useCallback(
    async ({ label, chainId, ...request }: TxRequest): Promise<TransactionReceipt | null> => {
      const id = nextId++;
      setBusy(label);
      ctx.upsert({ id, label, chainId, status: "pending" });
      try {
        if (walletChainId !== chainId) await switchChainAsync({ chainId });
        const hash = await writeContractAsync({ ...request, chainId } as never);
        ctx.upsert({ id, label, chainId, status: "pending", hash });
        const receipt = await waitForTransactionReceipt(config, { hash, chainId });
        if (receipt.status !== "success") throw new Error("Transaction reverted");
        ctx.upsert({ id, label, chainId, status: "confirmed", hash });
        return receipt as TransactionReceipt;
      } catch (err) {
        ctx.upsert({ id, label, chainId, status: "failed", error: errorMessage(err) });
        return null;
      } finally {
        setBusy(null);
        await queryClient.invalidateQueries();
      }
    },
    [config, ctx, queryClient, switchChainAsync, walletChainId, writeContractAsync]
  );

  return { send, busy };
}
