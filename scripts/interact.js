const hre = require("hardhat");
const { readFileSync } = require("fs");

async function main() {
  const { contracts } = JSON.parse(readFileSync(`./deployments/${hre.network.name}.json`, "utf8"));
  const [user] = await hre.ethers.getSigners();
  const { formatEther } = hre.ethers;

  const rwa = await hre.ethers.getContractAt("RWAAsset", contracts.RWAAsset);
  const pyt = await hre.ethers.getContractAt("YieldToken", contracts.YieldToken);
  const vault = await hre.ethers.getContractAt("PortalYieldVault", contracts.PortalYieldVault);

  const tokenId = 2;
  const pytBalance = async () => formatEther(await pyt.balanceOf(user.address));

  console.log(`User: ${user.address}`);
  console.log(`NFT #${tokenId} owner: ${await rwa.ownerOf(tokenId)}`);
  console.log(`PYT balance: ${await pytBalance()}\n`);

  let tx = await rwa.approve(contracts.PortalYieldVault, tokenId);
  console.log(`approve   tx ${(await tx.wait()).hash}`);

  tx = await vault.stake(tokenId);
  console.log(`stake     tx ${(await tx.wait()).hash}`);
  console.log(`  PYT balance after stake: ${await pytBalance()}`);

  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    await hre.network.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
    await hre.network.provider.send("evm_mine");
    console.log("  (advanced local chain time by 30 days)");
  }
  console.log(`  pending yield: ${formatEther(await vault.pendingYield(tokenId))} PYT`);

  tx = await vault.claimYield(tokenId);
  console.log(`claim     tx ${(await tx.wait()).hash}`);
  console.log(`  PYT balance after claim: ${await pytBalance()}`);

  tx = await vault.unstake(tokenId);
  console.log(`unstake   tx ${(await tx.wait()).hash}`);
  console.log(`  NFT #${tokenId} owner: ${await rwa.ownerOf(tokenId)}`);
  console.log(`  PYT balance after unstake: ${await pytBalance()}`);

  const [staked, totalPYT, totalYield] = await vault.getVaultStats();
  console.log(`\nVault stats: staked=${staked} principalPYT=${formatEther(totalPYT)} yieldPaid=${formatEther(totalYield)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
