const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🎯 Creating test series for AuroraPickem...\n");

  // Read deployed contract address
  const contractsPath = path.join(__dirname, "../frontend/src/constants/contracts.ts");
  if (!fs.existsSync(contractsPath)) {
    console.error("❌ Contract address file not found. Deploy contract first.");
    process.exit(1);
  }

  const content = fs.readFileSync(contractsPath, "utf8");
  const match = content.match(/AURORA_PICKEM_ADDRESS = "(0x[0-9a-fA-F]{40})"/);
  if (!match) {
    console.error("❌ Could not find contract address in constants file.");
    process.exit(1);
  }

  const contractAddress = match[1];
  console.log("📍 Contract address:", contractAddress);

  const [creator] = await hre.ethers.getSigners();
  console.log("👤 Creating with account:", creator.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(creator.address)), "ETH\n");

  const contract = await hre.ethers.getContractAt("AuroraPickem", contractAddress);

  // Test series data
  const series = [
    {
      seriesId: "FB-ATL-NY-2041",
      teamA: "Atlanta Flash",
      teamB: "New York Phantoms",
      entryFee: hre.ethers.parseEther("0.02"),
      duration: 3600 * 2 // 2 hours
    },
    {
      seriesId: "BB-LA-SF-2040",
      teamA: "Los Angeles Pulse",
      teamB: "San Francisco Orbit",
      entryFee: hre.ethers.parseEther("0.03"),
      duration: 3600 * 4 // 4 hours
    },
    {
      seriesId: "ES-VAL-HAV-2038",
      teamA: "Valiant Core",
      teamB: "Havoc Nine",
      entryFee: hre.ethers.parseEther("0.015"),
      duration: 3600 * 6 // 6 hours
    }
  ];

  console.log("📝 Creating series...\n");

  for (const s of series) {
    try {
      const tx = await contract.createReplicaSeries(
        s.seriesId,
        s.teamA,
        s.teamB,
        s.entryFee,
        s.duration
      );
      await tx.wait();

      console.log(`✅ Created: ${s.seriesId}`);
      console.log(`   ${s.teamA} vs ${s.teamB}`);
      console.log(`   Entry Fee: ${hre.ethers.formatEther(s.entryFee)} ETH`);
      console.log(`   Duration: ${s.duration / 3600} hours\n`);
    } catch (error) {
      console.error(`❌ Failed to create ${s.seriesId}:`, error.message);
    }
  }

  // Verify series were created
  const seriesList = await contract.listReplicaSeries();
  console.log(`\n🎉 Total series created: ${seriesList.length}`);
  console.log("Series IDs:", seriesList.join(", "));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
