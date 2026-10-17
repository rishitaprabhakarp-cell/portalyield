const hre = require("hardhat");
const { writeFileSync, mkdirSync } = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n🚀 PortalYield Deployment on Portaldot Network V3.0");
  console.log("=".repeat(60));
  console.log("Deployer address:", deployer.address);
  console.log(
    "Deployer balance:",
    hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)),
    "POT"
  );
  console.log("Network:", hre.network.name);
  console.log("=".repeat(60));

  console.log("\n[1/4] Deploying RWAAsset (ERC-721)...");
  const RWAAsset = await hre.ethers.getContractFactory("RWAAsset");
  const rwaAsset = await RWAAsset.deploy();
  await rwaAsset.waitForDeployment();
  const rwaAddress = await rwaAsset.getAddress();
  console.log("✅ RWAAsset deployed:", rwaAddress);

  console.log("\n[2/4] Deploying YieldToken (ERC-20 PYT)...");
  const YieldToken = await hre.ethers.getContractFactory("YieldToken");
  const yieldToken = await YieldToken.deploy();
  await yieldToken.waitForDeployment();
  const pytAddress = await yieldToken.getAddress();
  console.log("✅ YieldToken (PYT) deployed:", pytAddress);

  console.log("\n[3/4] Deploying PortalYieldVault...");
  const Vault = await hre.ethers.getContractFactory("PortalYieldVault");
  const vault = await Vault.deploy(rwaAddress, pytAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("✅ PortalYieldVault deployed:", vaultAddress);

  console.log("\n[4/4] Deploying CrossChainBridge...");
  const Bridge = await hre.ethers.getContractFactory("CrossChainBridge");
  const bridge = await Bridge.deploy(pytAddress);
  await bridge.waitForDeployment();
  const bridgeAddress = await bridge.getAddress();
  console.log("✅ CrossChainBridge deployed:", bridgeAddress);

  console.log("\n[Config] Authorizing Vault as PYT minter...");
  const tx1 = await yieldToken.setVault(vaultAddress);
  await tx1.wait();
  console.log("✅ Vault authorized as PYT minter");

  console.log("\n[Demo] Minting sample RWA assets...");
  const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
  const twoYearsFromNow = Math.floor(Date.now() / 1000) + 2 * 365 * 24 * 60 * 60;

  await (await rwaAsset.mintAsset(deployer.address, "ipfs://QmPortalYieldTBill001", 0, "US Treasury", 100000, oneYearFromNow, 520)).wait();
  console.log("✅ Minted T-Bill NFT (tokenId: 1) — $1,000 @ 5.20% APY");

  await (await rwaAsset.mintAsset(deployer.address, "ipfs://QmPortalYieldBond001", 1, "Apple Inc.", 500000, twoYearsFromNow, 750)).wait();
  console.log("✅ Minted Corporate Bond NFT (tokenId: 2) — $5,000 @ 7.50% APY");

  await (await rwaAsset.mintAsset(deployer.address, "ipfs://QmPortalYieldRE001", 2, "Manhattan REIT", 1000000, twoYearsFromNow, 800)).wait();
  console.log("✅ Minted Real Estate NFT (tokenId: 3) — $10,000 @ 8.00% APY");

  console.log("\n" + "=".repeat(60));
  console.log("🎉 PORTALDOT DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("\n📄 Contract Addresses:");
  console.log(`   RWAAsset (ERC-721):    ${rwaAddress}`);
  console.log(`   YieldToken (ERC-20):   ${pytAddress}`);
  console.log(`   PortalYieldVault:      ${vaultAddress}`);
  console.log(`   CrossChainBridge:      ${bridgeAddress}`);
  console.log("\n🌐 Network:", hre.network.name);
  console.log("👤 Deployer:", deployer.address);

  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      RWAAsset: rwaAddress,
      YieldToken: pytAddress,
      PortalYieldVault: vaultAddress,
      CrossChainBridge: bridgeAddress,
    },
    demoAssets: [
      { tokenId: 1, type: "T-Bill", issuer: "US Treasury", faceValue: "$1,000", yield: "5.20%" },
      { tokenId: 2, type: "Corporate Bond", issuer: "Apple Inc.", faceValue: "$5,000", yield: "7.50%" },
      { tokenId: 3, type: "Real Estate", issuer: "Manhattan REIT", faceValue: "$10,000", yield: "8.00%" },
    ],
  };

  mkdirSync("./deployments", { recursive: true });
  writeFileSync(`./deployments/${hre.network.name}.json`, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ./deployments/${hre.network.name}.json`);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
