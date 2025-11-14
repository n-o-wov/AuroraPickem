const hre = require("hardhat");

async function main() {
  console.log("🎯 Creating 30-day series for AuroraPickem...\n");

  const contractAddress = "0xb4321e8349E297d0FaaFb983402a81901c4D773b";
  console.log("📍 Contract address:", contractAddress);

  const [creator] = await hre.ethers.getSigners();
  console.log("👤 Creating with account:", creator.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(creator.address)), "ETH\n");

  const contract = await hre.ethers.getContractAt("AuroraPickem", contractAddress);

  // 30-day series data
  const series = [
    {
      seriesId: "NBA-LAL-BOS-2025Q1",
      teamA: "Los Angeles Lakers",
      teamB: "Boston Celtics",
      entryFee: hre.ethers.parseEther("0.01"),
      duration: 30 * 24 * 3600 // 30 days
    },
    {
      seriesId: "NFL-KC-SF-2025Q1",
      teamA: "Kansas City Chiefs",
      teamB: "San Francisco 49ers",
      entryFee: hre.ethers.parseEther("0.015"),
      duration: 30 * 24 * 3600 // 30 days
    },
    {
      seriesId: "MLB-NYY-LAD-2025Q1",
      teamA: "New York Yankees",
      teamB: "Los Angeles Dodgers",
      entryFee: hre.ethers.parseEther("0.02"),
      duration: 30 * 24 * 3600 // 30 days
    },
    {
      seriesId: "NHL-TOR-MTL-2025Q1",
      teamA: "Toronto Maple Leafs",
      teamB: "Montreal Canadiens",
      entryFee: hre.ethers.parseEther("0.012"),
      duration: 30 * 24 * 3600 // 30 days
    },
    {
      seriesId: "EPL-MCI-LIV-2025Q1",
      teamA: "Manchester City",
      teamB: "Liverpool FC",
      entryFee: hre.ethers.parseEther("0.018"),
      duration: 30 * 24 * 3600 // 30 days
    },
    {
      seriesId: "UCL-BAR-PSG-2025Q1",
      teamA: "FC Barcelona",
      teamB: "Paris Saint-Germain",
      entryFee: hre.ethers.parseEther("0.025"),
      duration: 30 * 24 * 3600 // 30 days
    }
  ];

  console.log("📝 Creating 30-day series...\n");

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
      console.log(`   Duration: 30 days\n`);
    } catch (error) {
      console.error(`❌ Failed to create ${s.seriesId}:`, error.message);
    }
  }

  // Verify series were created
  try {
    const seriesList = await contract.listReplicaSeries();
    console.log(`\n🎉 Total series created: ${seriesList.length}`);
    console.log("Series IDs:", seriesList.join(", "));
  } catch (error) {
    console.error("Error listing series:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
