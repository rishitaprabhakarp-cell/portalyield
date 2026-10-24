// Deploys the PYT token and bridge endpoint on a remote EVM chain.
const hre = require("hardhat");
const { saveDeployment } = require("./lib/exportFrontend");

const HOME_CHAIN_ID = parseInt(process.env.HOME_CHAIN_ID || "31337");

async function main() {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  const relayer = process.env.RELAYER_ADDRESS || (signers[2] ?? deployer).address;

  console.log(`Network ${hre.network.name} (chain ${hre.network.config.chainId})`);

  const pyt = await hre.ethers.deployContract("YieldToken");
  await pyt.waitForDeployment();
  const bridge = await hre.ethers.deployContract("CrossChainBridge", [await pyt.getAddress()]);
  await bridge.waitForDeployment();
  console.log(`  YieldToken         ${await pyt.getAddress()}`);
  console.log(`  CrossChainBridge   ${await bridge.getAddress()}`);

  await (await pyt.setMinter(await bridge.getAddress(), true)).wait();
  await (await bridge.setRelayer(relayer, true)).wait();
  await (await bridge.setSupportedChain(HOME_CHAIN_ID, true)).wait();
  console.log(`  Bridge minter set, relayer ${relayer}, route to chain ${HOME_CHAIN_ID}`);

  await saveDeployment(hre, {
    role: "remote",
    deployer: deployer.address,
    relayer,
    homeChainId: HOME_CHAIN_ID,
    contracts: { YieldToken: await pyt.getAddress(), CrossChainBridge: await bridge.getAddress() },
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
