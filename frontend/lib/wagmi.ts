import { createConfig, http, injected, mock } from "wagmi";
import { chains, IS_LOCAL } from "./contracts";

// First Hardhat dev account. The mock connector forwards eth_accounts to the node,
// which reports this account first, so it stays selected across reloads.
export const DEV_ACCOUNT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as const;

export const wagmiConfig = createConfig({
  chains,
  connectors: IS_LOCAL ? [mock({ accounts: [DEV_ACCOUNT], features: { reconnect: true } }), injected()] : [injected()],
  transports: Object.fromEntries(chains.map((c) => [c.id, http()])) as Record<(typeof chains)[number]["id"], ReturnType<typeof http>>,
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
