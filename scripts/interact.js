// Runs the full user flow against a deployed home chain: claim demo asset, stake, accrue, claim, unstake.
const hre = require("hardhat");
const { readFileSync } = require("fs");

async function main() {
  const { contracts } = JSON.parse(readFileSync(`./deployments/${hre.network.name}.json`, "utf8"));
  const [, user] = await hre.ethers.getSigners();
  const { formatEther } = hre.ethers;

  const rwa = (await hre.ethers.getContractAt("RWAAsset", contracts.RWAAsset)).connect(user);
  const pyt = await hre.ethers.getContractAt("YieldToken", contracts.YieldToken);
  const vault = (await hre.ethers.getContractAt("PortalYieldVault", contracts.PortalYieldVault)).connect(user);
  const pytBalance = async () => formatEther(await pyt.balanceOf(user.address));
  const log = async (label, tx) => console.log(`${label.padEnd(10)} tx ${(await (await tx).wait()).hash}`);

  console.log(`User ${user.address}\n`);
  if (!(await rwa.demoClaimed(user.address, 1))) await log("claim", rwa.claimDemoAsset(1));
  const ids = await rwa.tokensOfOwner(user.address);
  const tokenId = ids[ids.length - 1];
  console.log(`  holding asset #${tokenId}: ${(await rwa.getAssetData(tokenId)).issuer}`);

  await log("approve", rwa.approve(contracts.PortalYieldVault, tokenId));
  await log("stake", vault.stake(tokenId));
  console.log(`  PYT balance ${await pytBalance()}`);

  if (["localhost", "hardhat"].includes(hre.network.name)) {
    await hre.network.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
    await hre.network.provider.send("evm_mine");
    console.log("  advanced chain time 30 days");
  }
  console.log(`  pending yield ${formatEther(await vault.pendingYield(tokenId))} PYT`);

  await log("claim", vault.claimYield(tokenId));
  console.log(`  PYT balance ${await pytBalance()}`);
  await log("unstake", vault.unstake(tokenId));
  console.log(`  asset #${tokenId} owner ${await rwa.ownerOf(tokenId)}`);
  console.log(`  PYT balance ${await pytBalance()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
