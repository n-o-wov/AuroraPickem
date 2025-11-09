const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying AuroraPickem contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy AuroraPickem
  console.log("📦 Deploying AuroraPickem...");
  const AuroraPickem = await hre.ethers.getContractFactory("AuroraPickem");
  const contract = await AuroraPickem.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ AuroraPickem deployed to:", address);

  // Read contract constants
  const minEntryFee = await contract.MIN_ENTRY_FEE();
  const minDuration = await contract.MIN_DURATION();
  const maxDuration = await contract.MAX_DURATION();

  console.log("\n📋 Contract Configuration:");
  console.log("   MIN_ENTRY_FEE:", hre.ethers.formatEther(minEntryFee), "ETH");
  console.log("   MIN_DURATION:", minDuration.toString(), "seconds");
  console.log("   MAX_DURATION:", maxDuration.toString(), "seconds");

  // Update frontend contract address
  const contractsPath = path.join(__dirname, "../frontend/src/constants/contracts.ts");
  if (fs.existsSync(contractsPath)) {
    let content = fs.readFileSync(contractsPath, "utf8");
    content = content.replace(
      /export const AURORA_PICKEM_ADDRESS = "0x[0-9a-fA-F]{40}"/,
      `export const AURORA_PICKEM_ADDRESS = "${address}"`
    );
    fs.writeFileSync(contractsPath, content);
    console.log("\n✅ Updated frontend contract address");
  }

  console.log("\n🎉 Deployment complete!");
  console.log("\n📝 Next steps:");
  console.log("   1. Create test series: npm run create-series");
  console.log("   2. Update frontend .env with contract address");
  console.log("   3. Start frontend: cd frontend && npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
