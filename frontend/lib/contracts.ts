import type { Abi, Address } from "viem";
import { defineChain } from "viem";
import deployments from "./deployments.json";
import RWAAssetAbi from "./abi/RWAAsset.json";
import YieldTokenAbi from "./abi/YieldToken.json";
import VaultAbi from "./abi/PortalYieldVault.json";
import BridgeAbi from "./abi/CrossChainBridge.json";

export const abis = {
  rwa: RWAAssetAbi as Abi,
  pyt: YieldTokenAbi as Abi,
  vault: VaultAbi as Abi,
  bridge: BridgeAbi as Abi,
};

const LOCAL_RPC = "http://127.0.0.1:8545";
const REMOTE_LOCAL_RPC = "http://127.0.0.1:8546";

export const portaldotLocal = defineChain({
  id: 31337,
  name: "Portaldot (local)",
  nativeCurrency: { name: "POT", symbol: "POT", decimals: 18 },
  rpcUrls: { default: { http: [LOCAL_RPC] } },
});

export const ethereumLocal = defineChain({
  id: 31338,
  name: "Ethereum (local)",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [REMOTE_LOCAL_RPC] } },
});

export const portaldotTestnet = defineChain({
  id: Number(process.env.NEXT_PUBLIC_PORTALDOT_CHAIN_ID || 9999),
  name: "Portaldot testnet",
  nativeCurrency: { name: "POT", symbol: "POT", decimals: 18 },
  rpcUrls: { default: { http: [process.env.NEXT_PUBLIC_PORTALDOT_RPC_URL || "https://rpc-testnet.portaldot.io"] } },
  blockExplorers: process.env.NEXT_PUBLIC_PORTALDOT_EXPLORER_URL
    ? { default: { name: "Portaldot explorer", url: process.env.NEXT_PUBLIC_PORTALDOT_EXPLORER_URL } }
    : undefined,
});

export const HOME_CHAIN_ID = Number(process.env.NEXT_PUBLIC_HOME_CHAIN_ID || portaldotLocal.id);
export const REMOTE_CHAIN_ID = Number(process.env.NEXT_PUBLIC_REMOTE_CHAIN_ID || ethereumLocal.id);
export const IS_LOCAL = HOME_CHAIN_ID === portaldotLocal.id;

export const chains = IS_LOCAL ? ([portaldotLocal, ethereumLocal] as const) : ([portaldotTestnet, ethereumLocal] as const);
export const homeChain = chains[0];
export const remoteChain = chains.find((c) => c.id === REMOTE_CHAIN_ID) ?? chains[1];

type Deployment = { role: string; contracts: Record<string, Address> };
const byChain = deployments as Record<string, Deployment>;

export function contractsOn(chainId: number) {
  return byChain[String(chainId)]?.contracts;
}

export const home = contractsOn(HOME_CHAIN_ID);
export const remote = contractsOn(REMOTE_CHAIN_ID);

export function explorerTx(chainId: number, hash: string) {
  const chain = chains.find((c) => c.id === chainId);
  const base = chain?.blockExplorers?.default.url;
  return base ? `${base}/tx/${hash}` : undefined;
}

export const ASSET_TYPES = ["Treasury bill", "Corporate bond", "Real estate", "Commodity", "Equity"];

export const DEMO_ASSETS = [
  { kind: 0, label: "US Treasury bill", issuer: "US Treasury", face: 1000, apy: 5.2, term: "1 year" },
  { kind: 1, label: "Apple corporate bond", issuer: "Apple Inc.", face: 5000, apy: 7.5, term: "2 years" },
  { kind: 2, label: "Manhattan REIT", issuer: "Manhattan REIT", face: 10000, apy: 8.0, term: "2 years" },
];
