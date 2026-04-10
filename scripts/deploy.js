const { ethers, network, run } = require("hardhat");

async function main() {
  console.log("─".repeat(50));
  console.log(`Network: ${network.name}`);
  console.log("─".repeat(50));

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`Deployer:  ${deployer.address}`);
  console.log(`Balance:   ${ethers.formatEther(balance)} ETH`);

  const INITIAL_SUPPLY = ethers.parseEther("100000");

  console.log("\nDeploying VaultToken...");
  const VaultToken = await ethers.getContractFactory("VaultToken");
  const token = await VaultToken.deploy(deployer.address, INITIAL_SUPPLY);

  await token.waitForDeployment();
  const address = await token.getAddress();

  console.log(`Contract:  ${address}`);
  console.log(`Tx hash:   ${token.deploymentTransaction().hash}`);

  const name = await token.name();
  const symbol = await token.symbol();
  const totalSupply = await token.totalSupply();

  console.log("\n── Token Info ──────────────────────────────────");
  console.log(`Name:          ${name}`);
  console.log(`Symbol:        ${symbol}`);
  console.log(`Total supply:  ${ethers.formatEther(totalSupply)} VTK`);

  if (network.name === "sepolia") {
    console.log("\nWaiting 5 confirmations for Etherscan...");
    await token.deploymentTransaction().wait(5);

    try {
      await run("verify:verify", {
        address: address,
        constructorArguments: [deployer.address, INITIAL_SUPPLY],
      });
      console.log(`Verified: https://sepolia.etherscan.io/address/${address}`);
    } catch (err) {
      if (err.message.includes("Already Verified")) {
        console.log("Already verified.");
      } else {
        console.error("Verification failed:", err.message);
      }
    }
  }

  const fs = require("fs");
  if (!require("fs").existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }

  const info = {
    network: network.name,
    address,
    deployer: deployer.address,
    txHash: token.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    `deployments/${network.name}.json`,
    JSON.stringify(info, null, 2)
  );
  console.log(`\nSaved → deployments/${network.name}.json`);
  console.log("─".repeat(50));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});