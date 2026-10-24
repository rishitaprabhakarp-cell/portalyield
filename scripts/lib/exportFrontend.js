const { readFileSync, writeFileSync, mkdirSync, existsSync } = require("fs");
const path = require("path");

const FRONTEND_LIB = path.join(__dirname, "..", "..", "frontend", "lib");
const ABI_CONTRACTS = ["RWAAsset", "YieldToken", "PortalYieldVault", "CrossChainBridge"];

function explorerTx(hash) {
  const base = process.env.PORTALDOT_EXPLORER_URL;
  return base ? `${base.replace(/\/$/, "")}/tx/${hash}` : hash;
}

async function saveDeployment(hre, entry) {
  const { network } = hre;
  const chainId = Number((await hre.ethers.provider.getNetwork()).chainId);
  const record = { network: network.name, chainId, timestamp: new Date().toISOString(), ...entry };

  mkdirSync("./deployments", { recursive: true });
  writeFileSync(`./deployments/${network.name}.json`, JSON.stringify(record, null, 2) + "\n");

  const file = path.join(FRONTEND_LIB, "deployments.json");
  const all = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
  all[chainId] = { role: entry.role, contracts: entry.contracts };
  writeFileSync(file, JSON.stringify(all, null, 2) + "\n");

  const abiDir = path.join(FRONTEND_LIB, "abi");
  mkdirSync(abiDir, { recursive: true });
  for (const name of ABI_CONTRACTS) {
    const { abi } = hre.artifacts.readArtifactSync(name);
    writeFileSync(path.join(abiDir, `${name}.json`), JSON.stringify(abi, null, 2) + "\n");
  }

  console.log(`\nSaved deployments/${network.name}.json and updated frontend/lib/deployments.json`);
}

module.exports = { saveDeployment, explorerTx };
