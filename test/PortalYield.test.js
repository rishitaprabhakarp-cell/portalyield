const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PortalYield Protocol", function () {
  const ONE_YEAR = 365 * 24 * 60 * 60;

  async function deployFixture() {
    const [owner, user1, user2, relayer] = await ethers.getSigners();

    const RWAAsset = await ethers.getContractFactory("RWAAsset");
    const rwaAsset = await RWAAsset.deploy();
    await rwaAsset.waitForDeployment();

    const YieldToken = await ethers.getContractFactory("YieldToken");
    const yieldToken = await YieldToken.deploy();
    await yieldToken.waitForDeployment();

    const Vault = await ethers.getContractFactory("PortalYieldVault");
    const vault = await Vault.deploy(await rwaAsset.getAddress(), await yieldToken.getAddress());
    await vault.waitForDeployment();

    const Bridge = await ethers.getContractFactory("CrossChainBridge");
    const bridge = await Bridge.deploy(await yieldToken.getAddress());
    await bridge.waitForDeployment();

    await yieldToken.setVault(await vault.getAddress());
    await rwaAsset.setIssuerWhitelist(user1.address, true);
    await rwaAsset.setIssuerWhitelist(owner.address, true);

    return { rwaAsset, yieldToken, vault, bridge, owner, user1, user2, relayer };
  }

  // ── RWAAsset Tests ──────────────────────────────────────────────────────────
  describe("RWAAsset (ERC-721)", function () {
    it("should mint an RWA NFT successfully", async function () {
      const { rwaAsset, user1 } = await loadFixture(deployFixture);
      const maturity = (await time.latest()) + ONE_YEAR;

      await expect(
        rwaAsset.mintAsset(user1.address, "ipfs://test001", 0, "US Treasury", 100000, maturity, 520)
      )
        .to.emit(rwaAsset, "AssetMinted")
        .withArgs(1, user1.address, 0, "US Treasury", 100000, 520);

      expect(await rwaAsset.ownerOf(1)).to.equal(user1.address);
      expect(await rwaAsset.totalSupply()).to.equal(1);
    });

    it("should reject minting with past maturity date", async function () {
      const { rwaAsset } = await loadFixture(deployFixture);
      const pastDate = (await time.latest()) - 1;
      await expect(
        rwaAsset.mintAsset(
          (await ethers.getSigners())[0].address, "ipfs://test", 0, "Test", 100000, pastDate, 500
        )
      ).to.be.revertedWith("RWAAsset: invalid maturity date");
    });

    it("should reject minting by non-whitelisted address", async function () {
      const { rwaAsset, user2 } = await loadFixture(deployFixture);
      const maturity = (await time.latest()) + ONE_YEAR;
      await expect(
        rwaAsset.connect(user2).mintAsset(user2.address, "ipfs://test", 0, "Test", 100000, maturity, 500)
      ).to.be.revertedWith("RWAAsset: not a whitelisted issuer");
    });

    it("should calculate accrued yield after 30 days", async function () {
      const { rwaAsset, owner } = await loadFixture(deployFixture);
      const maturity = (await time.latest()) + ONE_YEAR;
      await rwaAsset.mintAsset(owner.address, "ipfs://test", 0, "US Treasury", 100000, maturity, 500);
      await time.increase(30 * 24 * 60 * 60);
      const yieldVal = await rwaAsset.accruedYield(1);
      expect(yieldVal).to.be.gt(0);
    });
  });

  // ── YieldToken Tests ────────────────────────────────────────────────────────
  describe("YieldToken (ERC-20 PYT)", function () {
    it("should have correct name, symbol and decimals", async function () {
      const { yieldToken } = await loadFixture(deployFixture);
      expect(await yieldToken.name()).to.equal("PortalYield Token");
      expect(await yieldToken.symbol()).to.equal("PYT");
      expect(await yieldToken.decimals()).to.equal(18);
    });

    it("should only allow vault to mint", async function () {
      const { yieldToken, user1 } = await loadFixture(deployFixture);
      await expect(
        yieldToken.connect(user1).mint(user1.address, ethers.parseEther("100"))
      ).to.be.revertedWith("YieldToken: caller is not the vault");
    });
  });

  // ── PortalYieldVault Tests ──────────────────────────────────────────────────
  describe("PortalYieldVault", function () {
    async function vaultFixture() {
      const base = await loadFixture(deployFixture);
      const { rwaAsset, vault, user1 } = base;

      const maturity = (await time.latest()) + ONE_YEAR;
      await rwaAsset.connect(user1).mintAsset(
        user1.address, "ipfs://test001", 0, "US Treasury", 100000, maturity, 520
      );
      await rwaAsset.connect(user1).approve(await vault.getAddress(), 1);

      return { ...base, tokenId: 1 };
    }

    it("should stake NFT and mint PYT tokens", async function () {
      const { vault, yieldToken, rwaAsset, user1, tokenId } = await loadFixture(vaultFixture);
      const pytBefore = await yieldToken.balanceOf(user1.address);

      await expect(vault.connect(user1).stake(tokenId)).to.emit(vault, "NFTStaked");

      const pytAfter = await yieldToken.balanceOf(user1.address);
      const pytMinted = pytAfter - pytBefore;
      // 100000 cents * 1e16 = 1e21 wei
      expect(pytMinted).to.equal(100000n * 10n ** 16n);
      expect(await rwaAsset.ownerOf(tokenId)).to.equal(await vault.getAddress());
    });

    it("should accrue yield over 180 days", async function () {
      const { vault, user1, tokenId } = await loadFixture(vaultFixture);
      await vault.connect(user1).stake(tokenId);
      await time.increase(180 * 24 * 60 * 60);

      const pending = await vault.pendingYield(tokenId);
      expect(pending).to.be.gt(0);
    });

    it("should allow yield claim and increase PYT balance", async function () {
      const { vault, yieldToken, user1, tokenId } = await loadFixture(vaultFixture);
      await vault.connect(user1).stake(tokenId);
      await time.increase(30 * 24 * 60 * 60);

      const balanceBefore = await yieldToken.balanceOf(user1.address);
      await expect(vault.connect(user1).claimYield(tokenId)).to.emit(vault, "YieldClaimed");
      const balanceAfter = await yieldToken.balanceOf(user1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("should unstake NFT and return to owner", async function () {
      const { vault, rwaAsset, user1, tokenId } = await loadFixture(vaultFixture);
      await vault.connect(user1).stake(tokenId);
      await time.increase(1);

      await expect(vault.connect(user1).unstake(tokenId)).to.emit(vault, "NFTUnstaked");
      expect(await rwaAsset.ownerOf(tokenId)).to.equal(user1.address);
    });

    it("should reject double staking", async function () {
      const { vault, user1, tokenId } = await loadFixture(vaultFixture);
      await vault.connect(user1).stake(tokenId);
      // After staking, NFT is held by vault — attempting to stake again fails ownership check
      await expect(vault.connect(user1).stake(tokenId)).to.be.reverted;
    });
  });

  // ── CrossChainBridge Tests ──────────────────────────────────────────────────
  describe("CrossChainBridge", function () {
    it("should allow owner to add relayers and chains", async function () {
      const { bridge, relayer } = await loadFixture(deployFixture);
      await bridge.setRelayer(relayer.address, true);
      await bridge.setSupportedChain(1, true);

      expect(await bridge.trustedRelayers(relayer.address)).to.be.true;
      expect(await bridge.supportedChains(1)).to.be.true;
    });

    it("should process inbound bridge message and mint PYT", async function () {
      const { bridge, yieldToken, relayer, user2 } = await loadFixture(deployFixture);
      await bridge.setRelayer(relayer.address, true);
      const amount = ethers.parseEther("100");

      // Set bridge as PYT minter
      await yieldToken.setVault(await bridge.getAddress());

      await expect(bridge.connect(relayer).bridgeIn(1, 42, user2.address, amount))
        .to.emit(bridge, "BridgeInCompleted")
        .withArgs(42, 1, user2.address, amount);

      expect(await yieldToken.balanceOf(user2.address)).to.equal(amount);
    });

    it("should reject duplicate inbound messages", async function () {
      const { bridge, yieldToken, relayer, user2 } = await loadFixture(deployFixture);
      await bridge.setRelayer(relayer.address, true);
      await yieldToken.setVault(await bridge.getAddress());

      await bridge.connect(relayer).bridgeIn(1, 42, user2.address, ethers.parseEther("100"));
      await expect(
        bridge.connect(relayer).bridgeIn(1, 42, user2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Bridge: already processed");
    });

    it("should reject unauthorized relayers", async function () {
      const { bridge, user2 } = await loadFixture(deployFixture);
      await expect(
        bridge.connect(user2).bridgeIn(1, 1, user2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Bridge: not a trusted relayer");
    });
  });
});
