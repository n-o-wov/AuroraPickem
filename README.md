# Aurora Pick'em

<div align="center">

**Privacy-Preserving Sports Prediction Platform with Fully Homomorphic Encryption**

[![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Zama fhEVM](https://img.shields.io/badge/Zama_fhEVM-v0.9.0-blue)](https://docs.zama.ai/fhevm)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.19.0-yellow)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)

[Overview](#-overview) •
[Features](#-key-features) •
[Architecture](#-system-architecture) •
[Getting Started](#-getting-started) •
[Testing](#-testing) •
[API](#-api-reference)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution Architecture](#-solution-architecture)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Smart Contract Design](#-smart-contract-design)
- [Privacy Guarantees](#-privacy-guarantees)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Security Considerations](#-security-considerations)
- [Roadmap](#-roadmap)

---

## 🎯 Overview

**Aurora Pick'em** is a decentralized sports prediction platform that leverages **Fully Homomorphic Encryption (FHE)** from Zama's fhEVM to enable privacy-preserving betting. Users can submit encrypted "confidence weights" representing their prediction strength without revealing their choices to others, ensuring a fair and transparent gaming environment.

Unlike traditional prediction markets where bet amounts and trends are publicly visible (potentially influencing behavior), Aurora Pick'em uses FHE to keep all confidence values encrypted on-chain until after the betting period closes, eliminating front-running and information asymmetry.

### 🌟 What Makes This Different?

Traditional betting platforms suffer from:
- **Information Asymmetry**: Late bettors can see betting trends
- **Front-Running**: Large bets influence market odds
- **Privacy Concerns**: Public betting history reveals user strategies
- **Trust Issues**: Centralized outcome determination

Aurora Pick'em solves these with:
- **Encrypted Confidence Values**: FHE ensures nobody can see individual bets
- **Fair Competition**: Equal footing without betting trend visibility
- **Decentralized Settlement**: On-chain randomness determines winners
- **Verifiable Fairness**: Transparent and auditable logic

---

## 🔍 Problem Statement

### Traditional Sports Betting Challenges

1. **Public Betting Pools**
   - Late participants gain unfair advantages
   - Large bets create copycat behavior
   - Sophisticated players manipulate markets

2. **Centralized Control**
   - Betting houses control everything
   - Users must trust operators
   - Limited transparency

3. **Privacy Violations**
   - Public betting patterns
   - Historical data profiling
   - Blockchain transparency exposes activities

---

## 💡 Solution Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    1. Series Creation                        │
│  Anyone creates: Lakers vs Warriors, 0.01 ETH fee           │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    2. Betting Period                         │
│  User A: Pick A, Confidence 🔒75                            │
│  User B: Pick B, Confidence 🔒60                            │
│  User C: Pick A, Confidence 🔒90                            │
│         All values encrypted on-chain                        │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    3. Settlement                             │
│  On-chain randomness determines: Team A wins!                │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   4. Prize Distribution                      │
│  User A: 0.015 ETH (winner)                                 │
│  User C: 0.015 ETH (winner)                                 │
│  User B: No prize (loser)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🔐 Privacy-First Design

- **Encrypted Confidence Values**: FHE encrypts 1-100 confidence weights
- **Zero Knowledge Until Settlement**: No betting trends visible
- **Fair Information Access**: Everyone has same information

### ⚖️ Decentralized & Trustless

- **Permissionless Creation**: Anyone creates prediction series
- **On-Chain Randomness**: Block hashes for settlement
- **Transparent Logic**: Publicly verifiable calculations
- **No Admin Privileges**: Owner can't manipulate outcomes

### 🎮 Engaging Gameplay

- **Confidence-Based Betting**: Express prediction strength
- **Multiple Series**: Participate in various events
- **User Dashboard**: Track all bets
- **Real-Time Updates**: Live status

### 💰 Fair Economics

- **Equal Prize Split**: Winners share pool equally
- **Configurable Entry Fees**: Flexible requirements
- **Refund Mechanism**: Cancelled/tied series refunds
- **Gas Optimized**: Efficient contract design

---

## 🛠 Technology Stack

### Smart Contract Layer

| Component | Version | Purpose |
|-----------|---------|---------|
| **Solidity** | ^0.8.24 | Smart contract language |
| **Zama fhEVM** | 0.9.0 | FHE operations |
| **Hardhat** | 2.19.0 | Development environment |
| **Ethers.js** | 6.13.0 | Ethereum interactions |

### Frontend Application

| Component | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.6.2 | Type safety |
| **Vite** | 5.4.19 | Build tool |
| **Wagmi** | 2.x | React hooks for Ethereum |
| **RainbowKit** | 2.x | Wallet connection |
| **Ant Design** | 5.22.5 | UI components |
| **TailwindCSS** | 3.4.1 | CSS framework |
| **Zustand** | 5.0.2 | State management |

---

## 🏗 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│  Series Hall  |  Series Detail  |  My Tickets               │
└────────────────────────┬─────────────────────────────────────┘
                         │
                    Frontend Hooks
                         │
┌────────────────────────┴─────────────────────────────────────┐
│                  AuroraPickem Smart Contract                 │
│  Series Management  |  Entry Processing  |  Settlement       │
│                         │                                     │
│                 Zama fhEVM Library                           │
│  Encrypt  |  Homomorphic Ops  |  Access Control             │
└──────────────────────┬───────────────────────────────────────┘
                       │
              Ethereum Sepolia Testnet
```

### Contract Architecture

```solidity
struct Series {
    string seriesId, teamA, teamB;
    uint256 entryFee, lockTime, prizePool;
    uint256[2] pickCounts;  // Team A & B
    bool cancelled, settled;
    uint8 winningTeam;
    address[] entrants;
}

struct EntryInfo {
    bool exists;
    uint8 pick;  // 0 = Team A, 1 = Team B
    bool claimed;
    euint64 weightCipher;  // Encrypted confidence
}
```

**Core Functions:**
- `createReplicaSeries()` - Create new betting series
- `enterReplicaSeries()` - Submit encrypted confidence
- `settleReplicaSeries()` - Determine winner
- `claimReplicaPrize()` - Collect winnings
- `claimReplicaRefund()` - Get refund
- `cancelReplicaSeries()` - Cancel series

---

## 📜 Smart Contract Design

### Encryption Flow

```
1. Client: User enters confidence 75
2. FHE SDK generates encrypted value + proof
3. Contract validates and stores encrypted value
4. Settlement uses on-chain randomness
5. Winners claim prizes
```

### Settlement Mechanism

```solidity
uint256 randomValue = uint256(block.prevrandao);
uint8 winningTeam = (randomValue % 2) + 1;
```

Benefits:
- ✅ No decryption needed
- ✅ Verifiable randomness
- ✅ Deterministic outcomes
- ✅ Instant settlement

---

## 🔒 Privacy Guarantees

### What's Encrypted

- **Confidence Values**: 1-100 weights encrypted with FHE
- **Betting Patterns**: Cannot determine distribution

### What's Public

- **Team Choices**: Picks are visible
- **Series Parameters**: Fees, times, teams
- **Settlement Outcome**: Winning team announced

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MetaMask wallet
- Sepolia ETH from [faucet](https://sepolia-faucet.pk910.de/)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/aurora-pickem.git
cd aurora-pickem

# Install dependencies
npm install
cd frontend && npm install && cd ..
```

### Environment Setup

Create `.env`:
```bash
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_private_key_here
```

Create `frontend/.env`:
```bash
VITE_AURORA_PICKEM_ADDRESS=0xYourContractAddress
```

### Compile & Deploy

```bash
# Compile
npm run compile

# Deploy
npm run deploy

# Start frontend
cd frontend && npm run dev
```

---

## 📁 Project Structure

```
aurora-pickem/
├── contracts/
│   └── AuroraPickem.sol              # Main contract
├── scripts/
│   ├── deploy.cjs                     # Deployment
│   └── create-series.cjs              # Test series
├── tests/
│   ├── AuroraPickem.test.js           # Unit tests (24)
│   ├── Integration.test.js            # Integration (10)
│   └── README.md                      # Test docs
├── frontend/
│   ├── src/
│   │   ├── components/                # React components
│   │   ├── pages/                     # Page components
│   │   ├── hooks/                     # Custom hooks
│   │   ├── lib/                       # Utilities
│   │   ├── config/                    # Configuration
│   │   └── stores/                    # State management
│   ├── package.json
│   └── vite.config.ts
├── hardhat.config.js
└── package.json
```

---

## 🧪 Testing

### Test Suite

**34 comprehensive tests:**
- ✅ 24 Unit Tests
- ✅ 10 Integration Tests

### Run Tests

```bash
# All tests
npx hardhat test

# Specific suite
npx hardhat test tests/AuroraPickem.test.js

# Coverage
npx hardhat coverage

# Gas report
REPORT_GAS=true npx hardhat test
```

### Gas Costs

| Operation | Gas Cost |
|-----------|----------|
| Create Series | ~150,000 |
| Enter Series | ~100,000 |
| Settle Series | ~80,000 |
| Claim Prize | ~50,000 |

See [tests/README.md](tests/README.md) for details.

---

## 🚀 Deployment

### Deploy to Sepolia

```bash
# Set up .env with SEPOLIA_RPC_URL and PRIVATE_KEY
npm run compile
npm run deploy

# Update frontend/.env with deployed address
# Create test series (optional)
npm run create-series
```

### Verify on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

---

## 📚 API Reference

### Core Functions

#### `createReplicaSeries`
```solidity
function createReplicaSeries(
    string memory seriesId,
    string memory teamA,
    string memory teamB,
    uint256 entryFee,
    uint256 duration
) external
```

Creates new prediction series.

---

#### `enterReplicaSeries`
```solidity
function enterReplicaSeries(
    string memory seriesId,
    uint8 pick,
    externalEuint64 encryptedConfidence,
    bytes calldata inputProof
) external payable
```

Submits encrypted confidence and team pick.

---

#### `settleReplicaSeries`
```solidity
function settleReplicaSeries(string memory seriesId) external
```

Settles series using on-chain randomness.

---

#### `claimReplicaPrize`
```solidity
function claimReplicaPrize(string memory seriesId) external
```

Claims prize as winner.

---

### View Functions

- `getReplicaSeries(seriesId)` - Get series details
- `getUserSeries(user)` - Get user's series IDs
- `listReplicaSeries()` - List all series
- `getReplicaEntry(seriesId, user)` - Get entry info
- `getSeriesPickCounts(seriesId)` - Get pick distribution

---

## 🔐 Security Considerations

### Smart Contract Security

1. **Reentrancy Protection**
   - Checks-effects-interactions pattern
   - State changes before external calls

2. **Access Control**
   - Owner-only functions protected
   - Permission checks on sensitive ops

3. **Overflow Protection**
   - Solidity 0.8.x built-in protection

4. **Front-Running Protection**
   - FHE prevents bet visibility
   - On-chain randomness

### Known Limitations

1. **Block Randomness**
   - `block.prevrandao` predictable by miners
   - OK for testnet, consider Chainlink VRF for prod

2. **Gas Costs**
   - FHE operations gas-intensive
   - May need layer-2 for scaling

---

## 🗺 Roadmap

### Phase 1: Foundation (Current)
- ✅ Core smart contract with FHE
- ✅ Frontend with wallet integration
- ✅ Comprehensive tests
- ✅ Sepolia deployment
- ✅ Documentation

### Phase 2: Enhancement (Q2 2024)
- 🔲 Chainlink VRF integration
- 🔲 Multi-outcome predictions
- 🔲 Mobile-responsive design
- 🔲 Social features

### Phase 3: Scaling (Q3 2024)
- 🔲 Layer-2 deployment
- 🔲 Gas optimizations
- 🔲 Oracle integration
- 🔲 Automated settlement

### Phase 4: Production (Q4 2024)
- 🔲 Security audit
- 🔲 Mainnet deployment
- 🔲 Governance token
- 🔲 DAO governance

---

## 🙏 Acknowledgments

- **Zama Team**: For fhEVM and FHE technology
- **Hardhat**: For development tools
- **Ethereum Community**: For decentralized future

---

## 🔗 Resources

- [Zama fhEVM Docs](https://docs.zama.ai/fhevm)
- [Hardhat Docs](https://hardhat.org/docs)
- [Wagmi Docs](https://wagmi.sh/)
- [RainbowKit Docs](https://www.rainbowkit.com/)

---

<div align="center">

**Built with ❤️ using Fully Homomorphic Encryption**

[⬆ Back to Top](#aurora-pickem)

</div>
