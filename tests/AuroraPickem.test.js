const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AuroraPickem Contract Tests", function () {
  let auroraPickem;
  let owner;
  let user1;
  let user2;
  let user3;

  const ENTRY_FEE = ethers.parseEther("0.01");
  const SERIES_DURATION = 7 * 24 * 60 * 60; // 7 days

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const AuroraPickem = await ethers.getContractFactory("AuroraPickem");
    auroraPickem = await AuroraPickem.deploy();
    await auroraPickem.waitForDeployment();
  });

  describe("Series Creation", function () {
    it("Should create a new series successfully", async function () {
      const seriesId = "NBA-2024-001";
      const teamA = "Lakers";
      const teamB = "Warriors";

      await expect(
        auroraPickem.createReplicaSeries(seriesId, teamA, teamB, ENTRY_FEE, SERIES_DURATION)
      ).to.emit(auroraPickem, "ReplicaSeriesCreated");

      const series = await auroraPickem.getReplicaSeries(seriesId);
      expect(series[0]).to.equal(teamA);
      expect(series[1]).to.equal(teamB);
      expect(series[2]).to.equal(ENTRY_FEE);
    });

    it("Should not allow creating duplicate series", async function () {
      const seriesId = "NBA-2024-001";
      const teamA = "Lakers";
      const teamB = "Warriors";

      await auroraPickem.createReplicaSeries(seriesId, teamA, teamB, ENTRY_FEE, SERIES_DURATION);

      await expect(
        auroraPickem.createReplicaSeries(seriesId, teamA, teamB, ENTRY_FEE, SERIES_DURATION)
      ).to.be.revertedWith("Series already exists");
    });

    it("Should require minimum entry fee", async function () {
      const seriesId = "NBA-2024-001";
      const teamA = "Lakers";
      const teamB = "Warriors";
      const lowFee = ethers.parseEther("0.005");

      await expect(
        auroraPickem.createReplicaSeries(seriesId, teamA, teamB, lowFee, SERIES_DURATION)
      ).to.be.revertedWith("Entry fee too low");
    });
  });

  describe("Series Entry", function () {
    let seriesId;
    let encryptedValue;
    let proof;

    beforeEach(async function () {
      seriesId = "NBA-2024-001";
      await auroraPickem.createReplicaSeries(
        seriesId,
        "Lakers",
        "Warriors",
        ENTRY_FEE,
        SERIES_DURATION
      );

      // Mock encrypted confidence value and proof
      encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      proof = ethers.hexlify(ethers.randomBytes(32));
    });

    it("Should allow users to enter series with Team A pick", async function () {
      const pick = 0; // Team A

      await expect(
        auroraPickem.connect(user1).enterReplicaSeries(
          seriesId,
          pick,
          encryptedValue,
          proof,
          { value: ENTRY_FEE }
        )
      ).to.emit(auroraPickem, "ReplicaEntrySubmitted");

      const entry = await auroraPickem.getReplicaEntry(seriesId, user1.address);
      expect(entry[0]).to.be.true; // exists
      expect(entry[1]).to.equal(pick);
      expect(entry[2]).to.be.false; // not claimed
    });

    it("Should allow users to enter series with Team B pick", async function () {
      const pick = 1; // Team B

      await expect(
        auroraPickem.connect(user1).enterReplicaSeries(
          seriesId,
          pick,
          encryptedValue,
          proof,
          { value: ENTRY_FEE }
        )
      ).to.emit(auroraPickem, "ReplicaEntrySubmitted");

      const entry = await auroraPickem.getReplicaEntry(seriesId, user1.address);
      expect(entry[1]).to.equal(pick);
    });

    it("Should not allow duplicate entries from same user", async function () {
      const pick = 0;

      await auroraPickem.connect(user1).enterReplicaSeries(
        seriesId,
        pick,
        encryptedValue,
        proof,
        { value: ENTRY_FEE }
      );

      await expect(
        auroraPickem.connect(user1).enterReplicaSeries(
          seriesId,
          pick,
          encryptedValue,
          proof,
          { value: ENTRY_FEE }
        )
      ).to.be.revertedWith("Already entered");
    });

    it("Should require exact entry fee", async function () {
      const pick = 0;
      const wrongFee = ethers.parseEther("0.005");

      await expect(
        auroraPickem.connect(user1).enterReplicaSeries(
          seriesId,
          pick,
          encryptedValue,
          proof,
          { value: wrongFee }
        )
      ).to.be.revertedWith("Incorrect entry fee");
    });

    it("Should not allow entry after lock time", async function () {
      const pick = 0;

      // Fast forward past lock time
      await time.increase(SERIES_DURATION + 1);

      await expect(
        auroraPickem.connect(user1).enterReplicaSeries(
          seriesId,
          pick,
          encryptedValue,
          proof,
          { value: ENTRY_FEE }
        )
      ).to.be.revertedWith("Series locked");
    });

    it("Should track multiple entrants", async function () {
      const pick = 0;

      await auroraPickem.connect(user1).enterReplicaSeries(
        seriesId,
        pick,
        encryptedValue,
        proof,
        { value: ENTRY_FEE }
      );

      await auroraPickem.connect(user2).enterReplicaSeries(
        seriesId,
        pick,
        encryptedValue,
        proof,
        { value: ENTRY_FEE }
      );

      const entrants = await auroraPickem.getReplicaEntrants(seriesId);
      expect(entrants.length).to.equal(2);
      expect(entrants).to.include(user1.address);
      expect(entrants).to.include(user2.address);
    });
  });

  describe("Series Settlement", function () {
    let seriesId;
    let encryptedValue;
    let proof;

    beforeEach(async function () {
      seriesId = "NBA-2024-001";
      await auroraPickem.createReplicaSeries(
        seriesId,
        "Lakers",
        "Warriors",
        ENTRY_FEE,
        SERIES_DURATION
      );

      encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      proof = ethers.hexlify(ethers.randomBytes(32));
    });

    it("Should settle series correctly", async function () {
      // User1 picks Team A, User2 picks Team B
      await auroraPickem.connect(user1).enterReplicaSeries(seriesId, 0, encryptedValue, proof, { value: ENTRY_FEE });
      await auroraPickem.connect(user2).enterReplicaSeries(seriesId, 1, encryptedValue, proof, { value: ENTRY_FEE });

      // Fast forward past lock time
      await time.increase(SERIES_DURATION + 1);

      // Settle with Team A winning
      await expect(
        auroraPickem.settleReplicaSeries(seriesId)
      ).to.emit(auroraPickem, "ReplicaSeriesSettled");

      const series = await auroraPickem.getReplicaSeries(seriesId);
      expect(series[6]).to.be.false; // not cancelled
      expect(series[7]).to.be.true; // settled
    });

    it("Should not allow settlement before lock time", async function () {
      await auroraPickem.connect(user1).enterReplicaSeries(seriesId, 0, encryptedValue, proof, { value: ENTRY_FEE });

      await expect(
        auroraPickem.settleReplicaSeries(seriesId)
      ).to.be.revertedWith("Not yet locked");
    });

    it("Should not allow double settlement", async function () {
      await auroraPickem.connect(user1).enterReplicaSeries(seriesId, 0, encryptedValue, proof, { value: ENTRY_FEE });

      await time.increase(SERIES_DURATION + 1);
      await auroraPickem.settleReplicaSeries(seriesId);

      await expect(
        auroraPickem.settleReplicaSeries(seriesId)
      ).to.be.revertedWith("Already settled or cancelled");
    });

    it("Only owner can settle series", async function () {
      await auroraPickem.connect(user1).enterReplicaSeries(seriesId, 0, encryptedValue, proof, { value: ENTRY_FEE });
      await time.increase(SERIES_DURATION + 1);

      await expect(
        auroraPickem.connect(user1).settleReplicaSeries(seriesId)
      ).to.be.revertedWithCustomError(auroraPickem, "OwnableUnauthorizedAccount");
    });
  });

  describe("Prize Claims", function () {
    let seriesId;
    let encryptedValue;
    let proof;

    beforeEach(async function () {
      seriesId = "NBA-2024-001";
      await auroraPickem.createReplicaSeries(
        seriesId,
        "Lakers",
        "Warriors",
        ENTRY_FEE,
        SERIES_DURATION
      );

      encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      proof = ethers.hexlify(ethers.randomBytes(32));
    });

    it("Should allow winner to claim prize", async function () {
      // User1 picks Team A (winner), User2 picks Team B
      await auroraPickem.connect(user1).enterReplicaSeries(seriesId, 0, encryptedValue, proof, { value: ENTRY_FEE });
      await auroraPickem.connect(user2).enterReplicaSeries(seriesId, 1, encryptedValue, proof, { value: ENTRY_FEE });

      await time.increase(SERIES_DURATION + 1);
      await auroraPickem.settleReplicaSeries(seriesId);

      const balanceBefore = await ethers.provider.getBalance(user1.address);

      await expect(
        auroraPickem.connect(user1).claimReplicaPrize(seriesId)
      ).to.emit(auroraPickem, "ReplicaPrizeClaimed");

      const balanceAfter = await ethers.provider.getBalance(user1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);

      const entry = await auroraPickem.getReplicaEntry(seriesId, user1.address);
      expect(entry[2]).to.be.true; // claimed
    });

    it("Should not allow loser to claim prize", async function () {
      await auroraPickem.connect(user1).enterReplicaSeries(seriesId, 0, encryptedValue, proof, { value: ENTRY_FEE });
      await auroraPickem.connect(user2).enterReplicaSeries(seriesId, 1, encryptedValue, proof, { value: ENTRY_FEE });

      await time.increase(SERIES_DURATION + 1);
      await auroraPickem.settleReplicaSeries(seriesId);

      await expect(
        auroraPickem.connect(user2).claimReplicaPrize(seriesId)
      ).to.be.revertedWith("Not a winner");
    });

    it("Should not allow double claims", async function () {
      await auroraPickem.connect(user1).enterReplicaSeries(seriesId, 0, encryptedValue, proof, { value: ENTRY_FEE });
      await auroraPickem.connect(user2).enterReplicaSeries(seriesId, 1, encryptedValue, proof, { value: ENTRY_FEE });

      await time.increase(SERIES_DURATION + 1);
      await auroraPickem.settleReplicaSeries(seriesId);

      await auroraPickem.connect(user1).claimReplicaPrize(seriesId);

      await expect(
        auroraPickem.connect(user1).claimReplicaPrize(seriesId)
      ).to.be.revertedWith("Already claimed");
    });

    it("Should not allow claim before settlement", async function () {
      await auroraPickem.connect(user1).enterReplicaSeries(seriesId, 0, encryptedValue, proof, { value: ENTRY_FEE });

      await expect(
        auroraPickem.connect(user1).claimReplicaPrize(seriesId)
      ).to.be.revertedWith("Not settled");
    });
  });

  describe("Series Cancellation", function () {
    let seriesId;
    let encryptedValue;
    let proof;

    beforeEach(async function () {
      seriesId = "NBA-2024-001";
      await auroraPickem.createReplicaSeries(
        seriesId,
        "Lakers",
        "Warriors",
        ENTRY_FEE,
        SERIES_DURATION
      );

      encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      proof = ethers.hexlify(ethers.randomBytes(32));
    });

    it("Should allow owner to cancel series", async function () {
      await auroraPickem.connect(user1).enterReplicaSeries(seriesId, 0, encryptedValue, proof, { value: ENTRY_FEE });

      await expect(
        auroraPickem.cancelReplicaSeries(seriesId)
      ).to.emit(auroraPickem, "ReplicaSeriesCancelled");

      const series = await auroraPickem.getReplicaSeries(seriesId);
      expect(series[6]).to.be.true; // cancelled
    });

    it("Should allow refunds after cancellation", async function () {
      await auroraPickem.connect(user1).enterReplicaSeries(seriesId, 0, encryptedValue, proof, { value: ENTRY_FEE });
      await auroraPickem.cancelReplicaSeries(seriesId);

      const balanceBefore = await ethers.provider.getBalance(user1.address);

      await expect(
        auroraPickem.connect(user1).claimReplicaRefund(seriesId)
      ).to.emit(auroraPickem, "ReplicaRefundClaimed");

      const balanceAfter = await ethers.provider.getBalance(user1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);

      const entry = await auroraPickem.getReplicaEntry(seriesId, user1.address);
      expect(entry[2]).to.be.true; // claimed (refund)
    });

    it("Only owner can cancel series", async function () {
      await expect(
        auroraPickem.connect(user1).cancelReplicaSeries(seriesId)
      ).to.be.revertedWithCustomError(auroraPickem, "OwnableUnauthorizedAccount");
    });

    it("Should not allow cancellation after settlement", async function () {
      await auroraPickem.connect(user1).enterReplicaSeries(seriesId, 0, encryptedValue, proof, { value: ENTRY_FEE });
      await time.increase(SERIES_DURATION + 1);
      await auroraPickem.settleReplicaSeries(seriesId);

      await expect(
        auroraPickem.cancelReplicaSeries(seriesId)
      ).to.be.revertedWith("Already settled or cancelled");
    });
  });

  describe("Pick Counts", function () {
    let seriesId;
    let encryptedValue;
    let proof;

    beforeEach(async function () {
      seriesId = "NBA-2024-001";
      await auroraPickem.createReplicaSeries(
        seriesId,
        "Lakers",
        "Warriors",
        ENTRY_FEE,
        SERIES_DURATION
      );

      encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      proof = ethers.hexlify(ethers.randomBytes(32));
    });

    it("Should track pick counts correctly", async function () {
      await auroraPickem.connect(user1).enterReplicaSeries(seriesId, 0, encryptedValue, proof, { value: ENTRY_FEE });
      await auroraPickem.connect(user2).enterReplicaSeries(seriesId, 0, encryptedValue, proof, { value: ENTRY_FEE });
      await auroraPickem.connect(user3).enterReplicaSeries(seriesId, 1, encryptedValue, proof, { value: ENTRY_FEE });

      const pickCounts = await auroraPickem.getSeriesPickCounts(seriesId);
      expect(pickCounts[0]).to.equal(2); // Team A picks
      expect(pickCounts[1]).to.equal(1); // Team B picks
    });
  });

  describe("User Series Tracking", function () {
    it("Should track all series a user has entered", async function () {
      const encryptedValue = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      // Create and enter multiple series
      const series1 = "NBA-2024-001";
      const series2 = "NBA-2024-002";

      await auroraPickem.createReplicaSeries(series1, "Lakers", "Warriors", ENTRY_FEE, SERIES_DURATION);
      await auroraPickem.createReplicaSeries(series2, "Celtics", "Heat", ENTRY_FEE, SERIES_DURATION);

      await auroraPickem.connect(user1).enterReplicaSeries(series1, 0, encryptedValue, proof, { value: ENTRY_FEE });
      await auroraPickem.connect(user1).enterReplicaSeries(series2, 1, encryptedValue, proof, { value: ENTRY_FEE });

      const userSeries = await auroraPickem.getUserSeries(user1.address);
      expect(userSeries.length).to.equal(2);
      expect(userSeries).to.include(series1);
      expect(userSeries).to.include(series2);
    });
  });

  describe("List All Series", function () {
    it("Should list all created series", async function () {
      const series1 = "NBA-2024-001";
      const series2 = "NBA-2024-002";

      await auroraPickem.createReplicaSeries(series1, "Lakers", "Warriors", ENTRY_FEE, SERIES_DURATION);
      await auroraPickem.createReplicaSeries(series2, "Celtics", "Heat", ENTRY_FEE, SERIES_DURATION);

      const allSeries = await auroraPickem.listReplicaSeries();
      expect(allSeries.length).to.equal(2);
      expect(allSeries).to.include(series1);
      expect(allSeries).to.include(series2);
    });
  });
});
