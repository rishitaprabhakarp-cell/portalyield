// Relays BridgeOutInitiated events between the home chain and a remote chain.
// Usage: node scripts/relayer.js
//   HOME_NETWORK / REMOTE_NETWORK   deployment names in ./deployments (default localhost / remote_local)
//   HOME_RPC / REMOTE_RPC           RPC URLs (default the two local Hardhat nodes)
//   RELAYER_KEY                     private key of the relayer registered on both bridges
const { ethers } = require("ethers");
const { readFileSync } = require("fs");

// Hardhat's well-known dev account #2; only valid on local nodes.
const DEFAULT_LOCAL_KEY = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
const POLL_MS = 2000;

const BRIDGE_ABI = [
  "event BridgeOutInitiated(uint256 indexed nonce, address indexed sender, uint256 indexed destinationChainId, address destinationAddress, uint256 amount, uint256 timestamp)",
  "function bridgeIn(uint256 sourceChainId, uint256 sourceNonce, address recipient, uint256 amount)",
  "function processedInbound(uint256 chainId, uint256 nonce) view returns (bool)",
];

function endpoint(networkName, rpcUrl, key) {
  const deployment = JSON.parse(readFileSync(`./deployments/${networkName}.json`, "utf8"));
  const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, { staticNetwork: true });
  const wallet = new ethers.NonceManager(new ethers.Wallet(key, provider));
  return {
    name: networkName,
    chainId: BigInt(deployment.chainId),
    provider,
    bridge: new ethers.Contract(deployment.contracts.CrossChainBridge, BRIDGE_ABI, wallet),
    nextBlock: 0,
  };
}

async function relay(source, dest) {
  const latest = await source.provider.getBlockNumber();
  if (latest < source.nextBlock) return;

  const events = await source.bridge.queryFilter(
    source.bridge.filters.BridgeOutInitiated(null, null, dest.chainId),
    source.nextBlock,
    latest
  );
  for (const { args, transactionHash } of events) {
    const { nonce, destinationAddress, amount } = args;
    if (await dest.bridge.processedInbound(source.chainId, nonce)) continue;

    const tx = await dest.bridge.bridgeIn(source.chainId, nonce, destinationAddress, amount);
    await tx.wait();
    console.log(
      `[${source.name} → ${dest.name}] nonce ${nonce}: ${ethers.formatEther(amount)} PYT to ${destinationAddress}` +
        `\n    source tx ${transactionHash}\n    dest tx   ${tx.hash}`
    );
  }
  // Only advance once every event in the range is delivered, so failures are retried.
  source.nextBlock = latest + 1;
}

async function main() {
  const key = process.env.RELAYER_KEY || DEFAULT_LOCAL_KEY;
  const home = endpoint(process.env.HOME_NETWORK || "localhost", process.env.HOME_RPC || "http://127.0.0.1:8545", key);
  const remote = endpoint(process.env.REMOTE_NETWORK || "remote_local", process.env.REMOTE_RPC || "http://127.0.0.1:8546", key);

  console.log(`Relayer ${new ethers.Wallet(key).address}`);
  console.log(`Watching ${home.name} (chain ${home.chainId}) <-> ${remote.name} (chain ${remote.chainId})`);

  for (;;) {
    for (const [src, dst] of [[home, remote], [remote, home]]) {
      try {
        await relay(src, dst);
      } catch (err) {
        console.error(`[${src.name} → ${dst.name}] ${err.shortMessage || err.message}`);
      }
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

main();
