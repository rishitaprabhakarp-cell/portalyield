// Deploys the full protocol to the home chain (Portaldot, or the local stand-in).
const hre = require("hardhat");
const { saveDeployment } = require("./lib/exportFrontend");

const REMOTE_CHAIN_ID = parseInt(process.env.REMOTE_CHAIN_ID || "31338");

async function deploy(name, ...args) {
  const contract = await hre.ethers.deployContract(name, args);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`  ${name.padEnd(18)} ${address}  (tx ${contract.deploymentTransaction().hash})`);
  return contract;
}

async function send(label, txPromise) {
  const receipt = await (await txPromise).wait();
  console.log(`  ${label.padEnd(36)} tx ${receipt.hash}`);
}

async function main() {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  const relayer = process.env.RELAYER_ADDRESS || (signers[2] ?? deployer).address;

  console.log(`Network ${hre.network.name} (chain ${hre.network.config.chainId})`);
  console.log(`Deployer ${deployer.address}`);
  console.log(`Balance  ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))}\n`);

  console.log("Deploying");
  const rwa = await deploy("RWAAsset");
  const pyt = await deploy("YieldToken");
  const vault = await deploy("PortalYieldVault", await rwa.getAddress(), await pyt.getAddress());
  const bridge = await deploy("CrossChainBridge", await pyt.getAddress());

  console.log("\nConfiguring");
  await send("PYT minter: vault", pyt.setMinter(await vault.getAddress(), true));
  await send("PYT minter: bridge", pyt.setMinter(await bridge.getAddress(), true));
  await send(`Bridge relayer: ${relayer.slice(0, 10)}…`, bridge.setRelayer(relayer, true));
  await send(`Bridge route: chain ${REMOTE_CHAIN_ID}`, bridge.setSupportedChain(REMOTE_CHAIN_ID, true));
  await send("Demo mode on", rwa.setDemoMode(true));

  const contracts = {
    RWAAsset: await rwa.getAddress(),
    YieldToken: await pyt.getAddress(),
    PortalYieldVault: await vault.getAddress(),
    CrossChainBridge: await bridge.getAddress(),
  };
  saveDeployment(hre, { role: "home", deployer: deployer.address, relayer, remoteChainId: REMOTE_CHAIN_ID, contracts });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
