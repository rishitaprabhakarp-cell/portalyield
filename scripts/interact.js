// Runs the user flow against a deployed home chain: claim a demo asset, stake, accrue, claim yield.
// Locally it also fast-forwards 30 days and unstakes; on a live network it leaves the position open
// so the app has something to show, and records every tx hash in deployments/<network>.json.
const hre = require("hardhat");
const { readFileSync, writeFileSync } = require("fs");
const { explorerTx } = require("./lib/exportFrontend");

const LOCAL = ["localhost", "hardhat"].includes(hre.network.name);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const file = `./deployments/${hre.network.name}.json`;
  const record = JSON.parse(readFileSync(file, "utf8"));
  const { contracts } = record;
  const signers = await hre.ethers.getSigners();
  const user = signers[1] ?? signers[0];
  const { formatEther } = hre.ethers;

  const rwa = (await hre.ethers.getContractAt("RWAAsset", contracts.RWAAsset)).connect(user);
  const pyt = await hre.ethers.getContractAt("YieldToken", contracts.YieldToken);
  const vault = (await hre.ethers.getContractAt("PortalYieldVault", contracts.PortalYieldVault)).connect(user);
  const pytBalance = async () => formatEther(await pyt.balanceOf(user.address));
  const activity = [];
  const log = async (label, tx) => {
    const { hash } = await (await tx).wait();
    activity.push({ label, hash });
    console.log(`${label.padEnd(24)} ${explorerTx(hash)}`);
  };

  console.log(`User ${user.address}\n`);
  let kind = -1;
  for (const k of [1, 2, 0]) {
    if (!(await rwa.demoClaimed(user.address, k))) {
      kind = k;
      break;
    }
  }
  if (kind < 0) throw new Error("This wallet has already claimed all three demo assets");

  await log(`Claim demo asset ${kind}`, rwa.claimDemoAsset(kind));
  const ids = await rwa.tokensOfOwner(user.address);
  const tokenId = ids[ids.length - 1];
  console.log(`  holding asset #${tokenId}: ${(await rwa.getAssetData(tokenId)).issuer}`);

  await log("Approve vault", rwa.approve(contracts.PortalYieldVault, tokenId));
  await log(`Stake asset #${tokenId}`, vault.stake(tokenId));
  console.log(`  PYT balance ${await pytBalance()}`);

  if (LOCAL) {
    await hre.network.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
    await hre.network.provider.send("evm_mine");
    console.log("  advanced chain time 30 days");
  } else {
    console.log("  waiting 30s for yield to accrue");
    await sleep(30_000);
  }
  console.log(`  pending yield ${formatEther(await vault.pendingYield(tokenId))} PYT`);

  await log(`Claim yield #${tokenId}`, vault.claimYield(tokenId));
  console.log(`  PYT balance ${await pytBalance()}`);

  if (LOCAL) {
    await log(`Unstake asset #${tokenId}`, vault.unstake(tokenId));
    console.log(`  asset #${tokenId} owner ${await rwa.ownerOf(tokenId)}`);
    console.log(`  PYT balance ${await pytBalance()}`);
  }

  record.activity = [...(record.activity ?? []), ...activity];
  writeFileSync(file, JSON.stringify(record, null, 2) + "\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
