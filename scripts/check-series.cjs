const hre = require("hardhat");

async function main() {
  const contractAddress = "0xb4321e8349E297d0FaaFb983402a81901c4D773b";
  
  console.log("📋 Checking AuroraPickem contract at:", contractAddress);
  console.log();
  
  const AuroraPickem = await hre.ethers.getContractAt("AuroraPickem", contractAddress);
  
  // Get list of series
  const seriesIds = await AuroraPickem.listReplicaSeries();
  console.log(`✅ Found ${seriesIds.length} series on-chain:`);
  console.log();
  
  for (const seriesId of seriesIds) {
    const series = await AuroraPickem.getReplicaSeries(seriesId);
    console.log(`📌 Series ID: ${seriesId}`);
    console.log(`   Team A: ${series[0]}`);
    console.log(`   Team B: ${series[1]}`);
    console.log(`   Entry Fee: ${hre.ethers.formatEther(series[2])} ETH`);
    console.log(`   Lock Time: ${new Date(Number(series[3]) * 1000).toLocaleString()}`);
    console.log(`   Prize Pool: ${hre.ethers.formatEther(series[4])} ETH`);
    console.log(`   Entry Count: ${series[5].toString()}`);
    console.log(`   Cancelled: ${series[6]}`);
    console.log(`   Settled: ${series[7]}`);
    console.log();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
