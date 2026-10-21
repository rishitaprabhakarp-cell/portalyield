const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

const ONE_YEAR = 365 * 24 * 60 * 60;
const THIRTY_DAYS = 30 * 24 * 60 * 60;
const PYT_PER_CENT = 10n ** 16n;
const REMOTE_CHAIN = 31338;

describe("PortalYield Protocol", function () {
  async function deployFixture() {
    const [owner, user1, user2, relayer] = await ethers.getSigners();

    const rwaAsset = await ethers.deployContract("RWAAsset");
    const yieldToken = await ethers.deployContract("YieldToken");
    const vault = await ethers.deployContract("PortalYieldVault", [
      await rwaAsset.getAddress(),
      await yieldToken.getAddress(),
    ]);
    const bridge = await ethers.deployContract("CrossChainBridge", [await yieldToken.getAddress()]);

    await yieldToken.setMinter(await vault.getAddress(), true);
    await yieldToken.setMinter(await bridge.getAddress(), true);
    await bridge.setRelayer(relayer.address, true);
    await bridge.setSupportedChain(REMOTE_CHAIN, true);
    await rwaAsset.setIssuerWhitelist(user1.address, true);

    return { rwaAsset, yieldToken, vault, bridge, owner, user1, user2, relayer };
  }

  async function stakedFixture() {
    const base = await deployFixture();
    const { rwaAsset, vault, user1 } = base;
    const maturity = (await time.latest()) + ONE_YEAR;
    await rwaAsset.connect(user1).mintAsset(user1.address, "ipfs://t", 0, "US Treasury", 100000, maturity, 520);
    await rwaAsset.connect(user1).approve(await vault.getAddress(), 1);
    await vault.connect(user1).stake(1);
    return { ...base, tokenId: 1, maturity };
  }

  describe("RWAAsset (ERC-721)", function () {
    it("mints an asset with its terms", async function () {
      const { rwaAsset, user1 } = await loadFixture(deployFixture);
      const maturity = (await time.latest()) + ONE_YEAR;

      await expect(rwaAsset.mintAsset(user1.address, "ipfs://t", 0, "US Treasury", 100000, maturity, 520))
        .to.emit(rwaAsset, "AssetMinted")
        .withArgs(1, user1.address, 0, "US Treasury", 100000, 520);

      expect(await rwaAsset.ownerOf(1)).to.equal(user1.address);
      expect((await rwaAsset.getAssetData(1)).faceValue).to.equal(100000);
    });

    it("rejects a maturity date in the past", async function () {
      const { rwaAsset, owner } = await loadFixture(deployFixture);
      const past = (await time.latest()) - 1;
      await expect(rwaAsset.mintAsset(owner.address, "ipfs://t", 0, "T", 100000, past, 500)).to.be.revertedWith(
        "RWAAsset: invalid maturity date"
      );
    });

    it("rejects minting by a non-whitelisted address", async function () {
      const { rwaAsset, user2 } = await loadFixture(deployFixture);
      const maturity = (await time.latest()) + ONE_YEAR;
      await expect(
        rwaAsset.connect(user2).mintAsset(user2.address, "ipfs://t", 0, "T", 100000, maturity, 500)
      ).to.be.revertedWith("RWAAsset: not a whitelisted issuer");
    });

    it("lets anyone claim each demo asset once while demo mode is on", async function () {
      const { rwaAsset, user2 } = await loadFixture(deployFixture);
      await expect(rwaAsset.connect(user2).claimDemoAsset(1)).to.be.revertedWith("RWAAsset: demo mode is off");

      await rwaAsset.setDemoMode(true);
      await rwaAsset.connect(user2).claimDemoAsset(1);
      await rwaAsset.connect(user2).claimDemoAsset(2);

      const data = await rwaAsset.getAssetData(1);
      expect(data.issuer).to.equal("Apple Inc.");
      expect(data.faceValue).to.equal(500000);
      expect(data.annualYieldBPS).to.equal(750);

      await expect(rwaAsset.connect(user2).claimDemoAsset(1)).to.be.revertedWith(
        "RWAAsset: demo asset already claimed"
      );
      await expect(rwaAsset.connect(user2).claimDemoAsset(3)).to.be.revertedWith("RWAAsset: unknown demo asset");
    });

    it("lists the token IDs an account holds", async function () {
      const { rwaAsset, user1, user2 } = await loadFixture(deployFixture);
      await rwaAsset.setDemoMode(true);
      await rwaAsset.connect(user1).claimDemoAsset(0);
      await rwaAsset.connect(user2).claimDemoAsset(0);
      await rwaAsset.connect(user1).claimDemoAsset(2);

      expect(await rwaAsset.tokensOfOwner(user1.address)).to.deep.equal([1n, 3n]);
      expect(await rwaAsset.tokensOfOwner(user2.address)).to.deep.equal([2n]);
    });
  });

  describe("YieldToken (ERC-20 PYT)", function () {
    it("has the expected metadata", async function () {
      const { yieldToken } = await loadFixture(deployFixture);
      expect(await yieldToken.name()).to.equal("PortalYield Token");
      expect(await yieldToken.symbol()).to.equal("PYT");
      expect(await yieldToken.decimals()).to.equal(18);
    });

    it("only lets approved minters mint or burn", async function () {
      const { yieldToken, user1 } = await loadFixture(deployFixture);
      await expect(yieldToken.connect(user1).mint(user1.address, 1)).to.be.revertedWith(
        "YieldToken: caller is not a minter"
      );
      await expect(yieldToken.connect(user1).burnFrom(user1.address, 1)).to.be.revertedWith(
        "YieldToken: caller is not a minter"
      );
    });

    it("only lets the owner change minters", async function () {
      const { yieldToken, user1 } = await loadFixture(deployFixture);
      await expect(yieldToken.connect(user1).setMinter(user1.address, true)).to.be.revertedWithCustomError(
        yieldToken,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("PortalYieldVault", function () {
    it("takes the NFT and mints 1 PYT per dollar of face value", async function () {
      const { vault, yieldToken, rwaAsset, user1, tokenId } = await loadFixture(stakedFixture);
      expect(await yieldToken.balanceOf(user1.address)).to.equal(100000n * PYT_PER_CENT);
      expect(await rwaAsset.ownerOf(tokenId)).to.equal(await vault.getAddress());
    });

    it("accrues yield at the asset's rate", async function () {
      const { vault, tokenId } = await loadFixture(stakedFixture);
      await time.increase(ONE_YEAR / 2);
      const pending = await vault.pendingYield(tokenId);
      // $1,000 at 5.2% for half a year ~= 26 PYT
      expect(pending).to.be.closeTo(ethers.parseEther("26"), ethers.parseEther("0.01"));
    });

    it("stops accruing at maturity", async function () {
      const { vault, tokenId } = await loadFixture(stakedFixture);
      await time.increase(ONE_YEAR + THIRTY_DAYS);
      const atMaturity = await vault.pendingYield(tokenId);
      await time.increase(THIRTY_DAYS);
      expect(await vault.pendingYield(tokenId)).to.equal(atMaturity);
      expect(atMaturity).to.be.closeTo(ethers.parseEther("52"), ethers.parseEther("0.01"));
    });

    it("pays yield on claim and resets the accrual clock", async function () {
      const { vault, yieldToken, user1, tokenId } = await loadFixture(stakedFixture);
      await time.increase(THIRTY_DAYS);

      const before = await yieldToken.balanceOf(user1.address);
      await expect(vault.connect(user1).claimYield(tokenId)).to.emit(vault, "YieldClaimed");
      expect(await yieldToken.balanceOf(user1.address)).to.be.gt(before);
      expect(await vault.pendingYield(tokenId)).to.equal(0);
    });

    it("only lets the staker claim", async function () {
      const { vault, user2, tokenId } = await loadFixture(stakedFixture);
      await time.increase(THIRTY_DAYS);
      await expect(vault.connect(user2).claimYield(tokenId)).to.be.revertedWith("Vault: not staker");
    });

    it("returns the NFT on unstake, burns principal and pays remaining yield", async function () {
      const { vault, rwaAsset, yieldToken, user1, tokenId } = await loadFixture(stakedFixture);
      await time.increase(THIRTY_DAYS);

      await expect(vault.connect(user1).unstake(tokenId)).to.emit(vault, "NFTUnstaked");
      expect(await rwaAsset.ownerOf(tokenId)).to.equal(user1.address);

      const balance = await yieldToken.balanceOf(user1.address);
      expect(balance).to.be.gt(0);
      expect(balance).to.be.lt(ethers.parseEther("5"));
    });

    it("fails to unstake if the principal PYT has been spent", async function () {
      const { vault, yieldToken, user1, user2, tokenId } = await loadFixture(stakedFixture);
      await yieldToken.connect(user1).transfer(user2.address, ethers.parseEther("500"));
      await expect(vault.connect(user1).unstake(tokenId)).to.be.reverted;
    });

    it("lists open positions with pending yield", async function () {
      const { vault, rwaAsset, user1, tokenId, maturity } = await loadFixture(stakedFixture);
      await time.increase(THIRTY_DAYS);

      const positions = await vault.getPositions(user1.address);
      expect(positions.length).to.equal(1);
      expect(positions[0].tokenId).to.equal(tokenId);
      expect(positions[0].maturityDate).to.equal(maturity);
      expect(positions[0].pendingYield).to.be.gt(0);

      await vault.connect(user1).unstake(tokenId);
      expect(await vault.getPositions(user1.address)).to.have.length(0);

      // Restaking the same token yields one position, not a stale duplicate.
      await rwaAsset.connect(user1).approve(await vault.getAddress(), tokenId);
      await vault.connect(user1).stake(tokenId);
      expect(await vault.getPositions(user1.address)).to.have.length(1);
    });

    it("rejects staking a token already in the vault", async function () {
      const { vault, user1, tokenId } = await loadFixture(stakedFixture);
      await expect(vault.connect(user1).stake(tokenId)).to.be.revertedWith("Vault: not NFT owner");
    });
  });

  describe("CrossChainBridge", function () {
    it("burns PYT on bridge out and emits a relayable event", async function () {
      const { bridge, yieldToken, user1 } = await loadFixture(stakedFixture);
      const amount = ethers.parseEther("250");
      const before = await yieldToken.balanceOf(user1.address);

      await expect(bridge.connect(user1).bridgeOut(REMOTE_CHAIN, user1.address, amount))
        .to.emit(bridge, "BridgeOutInitiated")
        .withArgs(1, user1.address, REMOTE_CHAIN, user1.address, amount, (ts) => ts > 0n);

      expect(await yieldToken.balanceOf(user1.address)).to.equal(before - amount);
    });

    it("rejects unsupported destination chains", async function () {
      const { bridge, user1 } = await loadFixture(stakedFixture);
      await expect(bridge.connect(user1).bridgeOut(1, user1.address, 1)).to.be.revertedWith(
        "Bridge: chain not supported"
      );
    });

    it("mints on bridge in from a trusted relayer", async function () {
      const { bridge, yieldToken, relayer, user2 } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("100");

      await expect(bridge.connect(relayer).bridgeIn(REMOTE_CHAIN, 42, user2.address, amount))
        .to.emit(bridge, "BridgeInCompleted")
        .withArgs(42, REMOTE_CHAIN, user2.address, amount);
      expect(await yieldToken.balanceOf(user2.address)).to.equal(amount);
    });

    it("rejects replayed messages", async function () {
      const { bridge, relayer, user2 } = await loadFixture(deployFixture);
      await bridge.connect(relayer).bridgeIn(REMOTE_CHAIN, 42, user2.address, 1);
      await expect(bridge.connect(relayer).bridgeIn(REMOTE_CHAIN, 42, user2.address, 1)).to.be.revertedWith(
        "Bridge: already processed"
      );
    });

    it("rejects untrusted relayers", async function () {
      const { bridge, user2 } = await loadFixture(deployFixture);
      await expect(bridge.connect(user2).bridgeIn(REMOTE_CHAIN, 1, user2.address, 1)).to.be.revertedWith(
        "Bridge: not a trusted relayer"
      );
    });
  });
});
