// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { EthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Aurora Pick'em - Fully Decentralized Encrypted Sports Confidence Pools
 * @notice Players choose teams and submit encrypted confidence values. After lockTime,
 *         anyone can settle using on-chain randomness. Winners split the prize pool.
 *         Fully permissionless - no organizer or admin privileges.
 */
contract AuroraPickem is EthereumConfig {
    struct Series {
        bool exists;
        string seriesId;
        string teamA;
        string teamB;
        uint256 entryFee;
        uint256 lockTime;
        uint256 prizePool;
        uint256 entryCount;
        uint256[2] pickCounts;
        bool cancelled;
        bool settled;
        uint8 winningTeam; // 0=未定, 1=A, 2=B, 3=平局
        address[] entrants;
    }

    struct EntryInfo {
        bool exists;
        uint8 pick;
        bool claimed;
        euint64 weightCipher;
    }

    mapping(string => Series) private seriesById;
    mapping(string => mapping(address => EntryInfo)) private entries;
    string[] private seriesIds;

    event SeriesCreated(string indexed seriesId, address indexed creator, uint256 entryFee, uint256 lockTime);
    event EntrySubmitted(string indexed seriesId, address indexed user, uint8 pick);
    event SeriesSettled(string indexed seriesId, uint8 winningTeam);
    event SeriesCancelled(string indexed seriesId);
    event PrizeClaimed(string indexed seriesId, address indexed user, uint256 amount);
    event RefundClaimed(string indexed seriesId, address indexed user, uint256 amount);

    error SeriesExists();
    error SeriesMissing();
    error InvalidFee();
    error InvalidDuration();
    error InvalidPick();
    error AlreadyJoined();
    error SeriesLocked();
    error NotSettled();
    error NotWinner();
    error AlreadyClaimed();
    error NotRefundable();
    error AlreadySettled();

    uint256 public constant MIN_ENTRY_FEE = 0.001 ether;
    uint256 public constant MIN_DURATION = 30 minutes;
    uint256 public constant MAX_DURATION = 60 days;

    /**
     * @notice Create a new Pick'em series
     * @dev Fully permissionless - anyone can create a series
     */
    function createReplicaSeries(
        string memory seriesId,
        string memory teamA,
        string memory teamB,
        uint256 entryFee,
        uint256 duration
    ) external {
        Series storage series = seriesById[seriesId];
        if (series.exists) revert SeriesExists();
        if (entryFee < MIN_ENTRY_FEE) revert InvalidFee();
        if (duration < MIN_DURATION || duration > MAX_DURATION) revert InvalidDuration();

        series.exists = true;
        series.seriesId = seriesId;
        series.teamA = teamA;
        series.teamB = teamB;
        series.entryFee = entryFee;
        series.lockTime = block.timestamp + duration;

        seriesIds.push(seriesId);

        emit SeriesCreated(seriesId, msg.sender, entryFee, series.lockTime);
    }

    /**
     * @notice Submit encrypted confidence value and team pick
     */
    function enterReplicaSeries(
        string memory seriesId,
        uint8 pick,
        externalEuint64 encryptedConfidence,
        bytes calldata inputProof
    ) external payable {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        if (series.cancelled) revert SeriesLocked();
        if (block.timestamp >= series.lockTime) revert SeriesLocked();
        if (pick > 1) revert InvalidPick();
        if (msg.value != series.entryFee) revert InvalidFee();

        EntryInfo storage entry = entries[seriesId][msg.sender];
        if (entry.exists) revert AlreadyJoined();

        euint64 weight = FHE.fromExternal(encryptedConfidence, inputProof);

        entry.exists = true;
        entry.pick = pick;
        entry.claimed = false;
        entry.weightCipher = weight;

        FHE.allow(weight, msg.sender);
        FHE.allowThis(weight);

        series.prizePool += msg.value;
        series.entryCount += 1;
        series.pickCounts[pick] += 1;
        series.entrants.push(msg.sender);

        emit EntrySubmitted(seriesId, msg.sender, pick);
    }

    /**
     * @notice Anyone can settle a series after lockTime using on-chain randomness
     * @dev Fully permissionless - no organizer restrictions
     */
    function settleReplicaSeries(string memory seriesId) external {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        if (series.cancelled) revert SeriesLocked();
        if (block.timestamp < series.lockTime) revert SeriesLocked();
        if (series.settled) revert AlreadySettled();

        // Use blockhash for random winner determination
        bytes32 randomHash = keccak256(abi.encode(blockhash(block.number - 1), seriesId));
        uint256 randomValue = uint256(randomHash) % 3;

        if (randomValue == 0) {
            series.winningTeam = 1; // Team A
        } else if (randomValue == 1) {
            series.winningTeam = 2; // Team B
        } else {
            series.winningTeam = 3; // Tie
        }

        series.settled = true;

        emit SeriesSettled(seriesId, series.winningTeam);
    }

    /**
     * @notice Anyone can cancel a series before lockTime if no entries exist
     * @dev Fully permissionless - no organizer restrictions
     */
    function cancelReplicaSeries(string memory seriesId) external {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        if (series.settled) revert AlreadySettled();
        if (series.entrants.length > 0) revert SeriesLocked(); // Cannot cancel if players joined
        if (block.timestamp >= series.lockTime) revert SeriesLocked(); // Can only cancel before lock

        series.cancelled = true;

        emit SeriesCancelled(seriesId);
    }

    /**
     * @notice Winners claim their prize share
     */
    function claimReplicaPrize(string memory seriesId) external {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        if (!series.settled || series.cancelled) revert NotSettled();
        if (series.winningTeam == 3) revert NotWinner();

        EntryInfo storage entry = entries[seriesId][msg.sender];
        if (!entry.exists) revert NotWinner();
        if (entry.pick + 1 != series.winningTeam) revert NotWinner();
        if (entry.claimed) revert AlreadyClaimed();

        uint256 winnerCount = series.pickCounts[entry.pick];
        require(winnerCount > 0, "No winners recorded");
        uint256 payout = series.prizePool / winnerCount;

        entry.claimed = true;
        (bool sent, ) = payable(msg.sender).call{ value: payout }("");
        require(sent, "Payout failed");

        emit PrizeClaimed(seriesId, msg.sender, payout);
    }

    /**
     * @notice Claim refund in case of tie or cancellation
     */
    function claimReplicaRefund(string memory seriesId) external {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();

        EntryInfo storage entry = entries[seriesId][msg.sender];
        if (!entry.exists) revert NotRefundable();
        if (entry.claimed) revert AlreadyClaimed();

        bool refundable = series.cancelled || (series.settled && series.winningTeam == 3);
        if (!refundable) revert NotRefundable();

        entry.claimed = true;
        (bool sent, ) = payable(msg.sender).call{ value: series.entryFee }("");
        require(sent, "Refund failed");

        emit RefundClaimed(seriesId, msg.sender, series.entryFee);
    }

    // ============================= VIEW FUNCTIONS =============================

    function getReplicaSeries(string memory seriesId)
        external
        view
        returns (
            string memory teamA,
            string memory teamB,
            uint256 entryFee,
            uint256 lockTime,
            uint256 prizePool,
            uint256 entryCount,
            bool cancelled,
            bool settled,
            uint8 winningTeam
        )
    {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        return (
            series.teamA,
            series.teamB,
            series.entryFee,
            series.lockTime,
            series.prizePool,
            series.entryCount,
            series.cancelled,
            series.settled,
            series.winningTeam
        );
    }

    function getReplicaEntrants(string memory seriesId) external view returns (address[] memory) {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        return series.entrants;
    }

    function getReplicaEntryCipher(string memory seriesId, address user) external view returns (bytes32) {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        EntryInfo storage entry = entries[seriesId][user];
        if (!entry.exists) revert NotWinner();
        return FHE.toBytes32(entry.weightCipher);
    }

    function listReplicaSeries() external view returns (string[] memory) {
        return seriesIds;
    }

    function getReplicaEntry(string memory seriesId, address user)
        external
        view
        returns (
            bool exists,
            uint8 pick,
            bool claimed
        )
    {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        EntryInfo storage entry = entries[seriesId][user];
        return (entry.exists, entry.pick, entry.claimed);
    }

    function getUserSeries(address user) external view returns (string[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < seriesIds.length; i++) {
            if (entries[seriesIds[i]][user].exists) {
                count++;
            }
        }

        string[] memory userSeriesIds = new string[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < seriesIds.length; i++) {
            if (entries[seriesIds[i]][user].exists) {
                userSeriesIds[index] = seriesIds[i];
                index++;
            }
        }

        return userSeriesIds;
    }

    function getSeriesPickCounts(string memory seriesId) external view returns (uint256[2] memory) {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        return series.pickCounts;
    }
}
