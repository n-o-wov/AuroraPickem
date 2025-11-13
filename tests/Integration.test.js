const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AuroraPickem Integration Tests", function () {
  let auroraPickem;
  let owner;
  let users;

  const ENTRY_FEE = ethers.parseEther("0.01");
  const SERIES_DURATION = 7 * 24 * 60 * 60;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    users = signers.slice(1, 11); // Use 10 users for testing

    const AuroraPickem = await ethers.getContractFactory("AuroraPickem");
    auroraPickem = await AuroraPickem.deploy();
    await auroraPickem.waitForDeployment();
  });

  describe("End-to-End Betting Flow", function () {
    it("Should handle complete betting lifecycle from creation to prize claim", async function () {
      const seriesId = "NBA-FINALS-2024";
      const teamA = "Lakers";
      const teamB = "Celtics";

      // Step 1: Create series
      await auroraPickem.createReplicaSeries(seriesId, teamA, teamB, ENTRY_FEE, SERIES_DURATION);

      // Step 2: Multiple users enter with different picks
      const encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      // 6 users pick Team A
      for (let i = 0; i < 6; i++) {
        await auroraPickem.connect(users[i]).enterReplicaSeries(
          seriesId,
          0,
          encryptedValue,
          proof,
          { value: ENTRY_FEE }
        );
      }

      // 4 users pick Team B
      for (let i = 6; i < 10; i++) {
        await auroraPickem.connect(users[i]).enterReplicaSeries(
          seriesId,
          1,
          encryptedValue,
          proof,
          { value: ENTRY_FEE }
        );
      }

      // Verify pick counts
      const pickCounts = await auroraPickem.getSeriesPickCounts(seriesId);
      expect(pickCounts[0]).to.equal(6);
      expect(pickCounts[1]).to.equal(4);

      // Step 3: Fast forward to lock time
      await time.increase(SERIES_DURATION + 1);

      // Step 4: Settle series (Team A wins)
      await auroraPickem.settleReplicaSeries(seriesId);

      // Step 5: Winners claim prizes
      const contractBalanceBefore = await ethers.provider.getBalance(await auroraPickem.getAddress());
      expect(contractBalanceBefore).to.equal(ethers.parseEther("0.1")); // 10 entries * 0.01 ETH

      // First winner claims
      const user0BalanceBefore = await ethers.provider.getBalance(users[0].address);
      await auroraPickem.connect(users[0]).claimReplicaPrize(seriesId);
      const user0BalanceAfter = await ethers.provider.getBalance(users[0].address);
      expect(user0BalanceAfter).to.be.gt(user0BalanceBefore);

      // All winners claim
      for (let i = 1; i < 6; i++) {
        await auroraPickem.connect(users[i]).claimReplicaPrize(seriesId);
      }

      // Step 6: Verify losers cannot claim
      await expect(
        auroraPickem.connect(users[6]).claimReplicaPrize(seriesId)
      ).to.be.revertedWith("Not a winner");
    });

    it("Should handle cancelled series with refunds", async function () {
      const seriesId = "CANCELLED-GAME";
      const teamA = "TeamA";
      const teamB = "TeamB";

      await auroraPickem.createReplicaSeries(seriesId, teamA, teamB, ENTRY_FEE, SERIES_DURATION);

      const encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      // Users enter series
      for (let i = 0; i < 5; i++) {
        await auroraPickem.connect(users[i]).enterReplicaSeries(
          seriesId,
          i % 2,
          encryptedValue,
          proof,
          { value: ENTRY_FEE }
        );
      }

      const contractBalance = await ethers.provider.getBalance(await auroraPickem.getAddress());
      expect(contractBalance).to.equal(ethers.parseEther("0.05"));

      // Cancel series
      await auroraPickem.cancelReplicaSeries(seriesId);

      // All users claim refunds
      for (let i = 0; i < 5; i++) {
        const balanceBefore = await ethers.provider.getBalance(users[i].address);
        await auroraPickem.connect(users[i]).claimReplicaRefund(seriesId);
        const balanceAfter = await ethers.provider.getBalance(users[i].address);
        expect(balanceAfter).to.be.gt(balanceBefore);
      }
    });
  });

  describe("Multiple Series Management", function () {
    it("Should handle multiple concurrent series", async function () {
      const encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      // Create 5 different series
      const seriesIds = [
        "NBA-GAME-1",
        "NBA-GAME-2",
        "NBA-GAME-3",
        "MLB-GAME-1",
        "NHL-GAME-1"
      ];

      for (const seriesId of seriesIds) {
        await auroraPickem.createReplicaSeries(
          seriesId,
          "TeamA",
          "TeamB",
          ENTRY_FEE,
          SERIES_DURATION
        );
      }

      // User enters all 5 series
      for (const seriesId of seriesIds) {
        await auroraPickem.connect(users[0]).enterReplicaSeries(
          seriesId,
          0,
          encryptedValue,
          proof,
          { value: ENTRY_FEE }
        );
      }

      // Verify user's series list
      const userSeries = await auroraPickem.getUserSeries(users[0].address);
      expect(userSeries.length).to.equal(5);

      // Verify global series list
      const allSeries = await auroraPickem.listReplicaSeries();
      expect(allSeries.length).to.equal(5);
    });

    it("Should allow same user to have different picks across series", async function () {
      const encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      const series1 = "GAME-1";
      const series2 = "GAME-2";

      await auroraPickem.createReplicaSeries(series1, "TeamA", "TeamB", ENTRY_FEE, SERIES_DURATION);
      await auroraPickem.createReplicaSeries(series2, "TeamC", "TeamD", ENTRY_FEE, SERIES_DURATION);

      // Pick Team A in series1
      await auroraPickem.connect(users[0]).enterReplicaSeries(series1, 0, encryptedValue, proof, { value: ENTRY_FEE });

      // Pick Team B in series2
      await auroraPickem.connect(users[0]).enterReplicaSeries(series2, 1, encryptedValue, proof, { value: ENTRY_FEE });

      const entry1 = await auroraPickem.getReplicaEntry(series1, users[0].address);
      const entry2 = await auroraPickem.getReplicaEntry(series2, users[0].address);

      expect(entry1[1]).to.equal(0); // Team A
      expect(entry2[1]).to.equal(1); // Team B
    });
  });

  describe("Prize Distribution", function () {
    it("Should distribute prizes proportionally among winners", async function () {
      const seriesId = "PRIZE-TEST";
      const encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      await auroraPickem.createReplicaSeries(seriesId, "TeamA", "TeamB", ENTRY_FEE, SERIES_DURATION);

      // 3 users pick Team A (winners)
      for (let i = 0; i < 3; i++) {
        await auroraPickem.connect(users[i]).enterReplicaSeries(
          seriesId,
          0,
          encryptedValue,
          proof,
          { value: ENTRY_FEE }
        );
      }

      // 7 users pick Team B (losers)
      for (let i = 3; i < 10; i++) {
        await auroraPickem.connect(users[i]).enterReplicaSeries(
          seriesId,
          1,
          encryptedValue,
          proof,
          { value: ENTRY_FEE }
        );
      }

      await time.increase(SERIES_DURATION + 1);
      await auroraPickem.settleReplicaSeries(seriesId);

      const totalPrizePool = ethers.parseEther("0.1"); // 10 * 0.01 ETH
      const winners = 3;

      // Each winner should receive approximately 1/3 of total pool
      const expectedPrizePerWinner = totalPrizePool / BigInt(winners);

      for (let i = 0; i < 3; i++) {
        const balanceBefore = await ethers.provider.getBalance(users[i].address);
        const tx = await auroraPickem.connect(users[i]).claimReplicaPrize(seriesId);
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * tx.gasPrice;
        const balanceAfter = await ethers.provider.getBalance(users[i].address);

        const actualPrize = balanceAfter + gasUsed - balanceBefore;

        // Allow for small rounding differences
        expect(actualPrize).to.be.closeTo(expectedPrizePerWinner, ethers.parseEther("0.0001"));
      }
    });
  });

  describe("Edge Cases", function () {
    it("Should handle series with only one participant", async function () {
      const seriesId = "LONELY-GAME";
      const encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      await auroraPickem.createReplicaSeries(seriesId, "TeamA", "TeamB", ENTRY_FEE, SERIES_DURATION);

      await auroraPickem.connect(users[0]).enterReplicaSeries(
        seriesId,
        0,
        encryptedValue,
        proof,
        { value: ENTRY_FEE }
      );

      await time.increase(SERIES_DURATION + 1);
      await auroraPickem.settleReplicaSeries(seriesId);

      // Winner should get full prize
      const balanceBefore = await ethers.provider.getBalance(users[0].address);
      await auroraPickem.connect(users[0]).claimReplicaPrize(seriesId);
      const balanceAfter = await ethers.provider.getBalance(users[0].address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should handle series where all users pick the losing team", async function () {
      const seriesId = "ALL-WRONG";
      const encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      await auroraPickem.createReplicaSeries(seriesId, "TeamA", "TeamB", ENTRY_FEE, SERIES_DURATION);

      // All users pick Team B
      for (let i = 0; i < 5; i++) {
        await auroraPickem.connect(users[i]).enterReplicaSeries(
          seriesId,
          1,
          encryptedValue,
          proof,
          { value: ENTRY_FEE }
        );
      }

      await time.increase(SERIES_DURATION + 1);
      await auroraPickem.settleReplicaSeries(seriesId); // Team A wins by default

      // No one can claim prizes
      for (let i = 0; i < 5; i++) {
        await expect(
          auroraPickem.connect(users[i]).claimReplicaPrize(seriesId)
        ).to.be.revertedWith("Not a winner");
      }
    });

    it("Should handle large number of participants", async function () {
      const seriesId = "BIG-GAME";
      const encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      await auroraPickem.createReplicaSeries(seriesId, "TeamA", "TeamB", ENTRY_FEE, SERIES_DURATION);

      // All 10 test users enter
      for (let i = 0; i < 10; i++) {
        await auroraPickem.connect(users[i]).enterReplicaSeries(
          seriesId,
          i % 2,
          encryptedValue,
          proof,
          { value: ENTRY_FEE }
        );
      }

      const entrants = await auroraPickem.getReplicaEntrants(seriesId);
      expect(entrants.length).to.equal(10);

      const pickCounts = await auroraPickem.getSeriesPickCounts(seriesId);
      expect(pickCounts[0]).to.equal(5);
      expect(pickCounts[1]).to.equal(5);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should measure gas costs for common operations", async function () {
      const seriesId = "GAS-TEST";
      const encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      // Measure series creation
      const createTx = await auroraPickem.createReplicaSeries(
        seriesId,
        "TeamA",
        "TeamB",
        ENTRY_FEE,
        SERIES_DURATION
      );
      const createReceipt = await createTx.wait();
      console.log(`    Gas for series creation: ${createReceipt.gasUsed.toString()}`);

      // Measure entry
      const entryTx = await auroraPickem.connect(users[0]).enterReplicaSeries(
        seriesId,
        0,
        encryptedValue,
        proof,
        { value: ENTRY_FEE }
      );
      const entryReceipt = await entryTx.wait();
      console.log(`    Gas for series entry: ${entryReceipt.gasUsed.toString()}`);

      // Add more entries
      for (let i = 1; i < 5; i++) {
        await auroraPickem.connect(users[i]).enterReplicaSeries(
          seriesId,
          i % 2,
          encryptedValue,
          proof,
          { value: ENTRY_FEE }
        );
      }

      await time.increase(SERIES_DURATION + 1);

      // Measure settlement
      const settleTx = await auroraPickem.settleReplicaSeries(seriesId);
      const settleReceipt = await settleTx.wait();
      console.log(`    Gas for series settlement: ${settleReceipt.gasUsed.toString()}`);

      // Measure prize claim
      const claimTx = await auroraPickem.connect(users[0]).claimReplicaPrize(seriesId);
      const claimReceipt = await claimTx.wait();
      console.log(`    Gas for prize claim: ${claimReceipt.gasUsed.toString()}`);
    });
  });

  describe("State Consistency", function () {
    it("Should maintain correct state throughout series lifecycle", async function () {
      const seriesId = "STATE-TEST";
      const encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      // Initial state
      let series = await auroraPickem.getReplicaSeries(seriesId);
      expect(series[0]).to.equal(""); // teamA is empty

      // After creation
      await auroraPickem.createReplicaSeries(seriesId, "TeamA", "TeamB", ENTRY_FEE, SERIES_DURATION);
      series = await auroraPickem.getReplicaSeries(seriesId);
      expect(series[0]).to.equal("TeamA");
      expect(series[6]).to.be.false; // not cancelled
      expect(series[7]).to.be.false; // not settled

      // After entries
      await auroraPickem.connect(users[0]).enterReplicaSeries(seriesId, 0, encryptedValue, proof, { value: ENTRY_FEE });
      const entry = await auroraPickem.getReplicaEntry(seriesId, users[0].address);
      expect(entry[0]).to.be.true; // exists
      expect(entry[2]).to.be.false; // not claimed

      // After settlement
      await time.increase(SERIES_DURATION + 1);
      await auroraPickem.settleReplicaSeries(seriesId);
      series = await auroraPickem.getReplicaSeries(seriesId);
      expect(series[7]).to.be.true; // settled

      // After claim
      await auroraPickem.connect(users[0]).claimReplicaPrize(seriesId);
      const entryAfterClaim = await auroraPickem.getReplicaEntry(seriesId, users[0].address);
      expect(entryAfterClaim[2]).to.be.true; // claimed
    });
  });
});
