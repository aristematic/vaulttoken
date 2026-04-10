const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("VaultToken", function () {
  const INITIAL_SUPPLY = ethers.parseEther("100000");
  const MAX_SUPPLY = ethers.parseEther("1000000");

  async function deployVaultTokenFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const VaultToken = await ethers.getContractFactory("VaultToken");
    const token = await VaultToken.deploy(owner.address, INITIAL_SUPPLY);
    return { token, owner, alice, bob };
  }

  describe("Deployment", function () {
    it("should set correct name and symbol", async function () {
      const { token } = await loadFixture(deployVaultTokenFixture);
      expect(await token.name()).to.equal("VaultToken");
      expect(await token.symbol()).to.equal("VTK");
    });

    it("should mint initial supply to owner", async function () {
      const { token, owner } = await loadFixture(deployVaultTokenFixture);
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("should set correct MAX_SUPPLY", async function () {
      const { token } = await loadFixture(deployVaultTokenFixture);
      expect(await token.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it("should revert if deployed with zero address", async function () {
      const VaultToken = await ethers.getContractFactory("VaultToken");
      await expect(
        VaultToken.deploy(ethers.ZeroAddress, INITIAL_SUPPLY)
      ).to.be.revertedWithCustomError(VaultToken, "OwnableInvalidOwner");
    });
  });

  describe("Minting", function () {
    it("should allow owner to mint tokens", async function () {
      const { token, owner, alice } = await loadFixture(deployVaultTokenFixture);
      const mintAmount = ethers.parseEther("5000");
      await token.connect(owner).mint(alice.address, mintAmount);
      expect(await token.balanceOf(alice.address)).to.equal(mintAmount);
    });

    it("should emit TokensMinted event", async function () {
      const { token, owner, alice } = await loadFixture(deployVaultTokenFixture);
      const mintAmount = ethers.parseEther("1000");
      await expect(token.connect(owner).mint(alice.address, mintAmount))
        .to.emit(token, "TokensMinted")
        .withArgs(alice.address, mintAmount);
    });

    it("should revert if non-owner tries to mint", async function () {
      const { token, alice, bob } = await loadFixture(deployVaultTokenFixture);
      await expect(
        token.connect(alice).mint(bob.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("should revert mint beyond MAX_SUPPLY", async function () {
      const { token, owner, alice } = await loadFixture(deployVaultTokenFixture);
      await expect(
        token.connect(owner).mint(alice.address, MAX_SUPPLY)
      ).to.be.revertedWithCustomError(token, "ExceedsMaxSupply");
    });

    it("should revert mint to zero address", async function () {
      const { token, owner } = await loadFixture(deployVaultTokenFixture);
      await expect(
        token.connect(owner).mint(ethers.ZeroAddress, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(token, "ZeroAddress");
    });

    it("should revert mint of zero amount", async function () {
      const { token, owner, alice } = await loadFixture(deployVaultTokenFixture);
      await expect(
        token.connect(owner).mint(alice.address, 0)
      ).to.be.revertedWithCustomError(token, "ZeroAmount");
    });
  });

  describe("Transfers", function () {
    it("should transfer tokens between accounts", async function () {
      const { token, owner, alice } = await loadFixture(deployVaultTokenFixture);
      const amount = ethers.parseEther("500");
      await token.connect(owner).transfer(alice.address, amount);
      expect(await token.balanceOf(alice.address)).to.equal(amount);
    });

    it("should revert transfer if insufficient balance", async function () {
      const { token, alice, bob } = await loadFixture(deployVaultTokenFixture);
      await expect(
        token.connect(alice).transfer(bob.address, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });
  });

  describe("Burning", function () {
    it("should allow holder to burn tokens", async function () {
      const { token, owner } = await loadFixture(deployVaultTokenFixture);
      const burnAmount = ethers.parseEther("1000");
      const supplyBefore = await token.totalSupply();
      await token.connect(owner).burn(burnAmount);
      expect(await token.totalSupply()).to.equal(supplyBefore - burnAmount);
    });
  });

  describe("remainingSupply()", function () {
    it("should return correct remaining supply", async function () {
      const { token } = await loadFixture(deployVaultTokenFixture);
      expect(await token.remainingSupply()).to.equal(MAX_SUPPLY - INITIAL_SUPPLY);
    });
  });
});
