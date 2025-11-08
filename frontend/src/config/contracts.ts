import type { Address } from "viem";

const defaultAddress = "0x0000000000000000000000000000000000000000";
const envAddress = import.meta.env.VITE_AURORA_PICKEM_ADDRESS;

if (!envAddress || envAddress === defaultAddress) {
  console.warn(
    "[AuroraPickem] Contract address not set. Please configure VITE_AURORA_PICKEM_ADDRESS in your .env file."
  );
}

export const AURORA_PICKEM_ADDRESS: Address = (
  envAddress || defaultAddress
) as Address;

export const AURORA_PICKEM_ABI = [
  // Constants
  {
    type: "function",
    name: "MIN_ENTRY_FEE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "MIN_DURATION",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "MAX_DURATION",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  // Read functions
  {
    type: "function",
    name: "listReplicaSeries",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string[]" }]
  },
  {
    type: "function",
    name: "getReplicaSeries",
    stateMutability: "view",
    inputs: [{ name: "seriesId", type: "string" }],
    outputs: [
      { name: "teamA", type: "string" },
      { name: "teamB", type: "string" },
      { name: "entryFee", type: "uint256" },
      { name: "lockTime", type: "uint256" },
      { name: "prizePool", type: "uint256" },
      { name: "entryCount", type: "uint256" },
      { name: "cancelled", type: "bool" },
      { name: "settled", type: "bool" },
      { name: "winningTeam", type: "uint8" }
    ]
  },
  {
    type: "function",
    name: "getReplicaEntrants",
    stateMutability: "view",
    inputs: [{ name: "seriesId", type: "string" }],
    outputs: [{ name: "", type: "address[]" }]
  },
  {
    type: "function",
    name: "getReplicaEntry",
    stateMutability: "view",
    inputs: [
      { name: "seriesId", type: "string" },
      { name: "user", type: "address" }
    ],
    outputs: [
      { name: "exists", type: "bool" },
      { name: "pick", type: "uint8" },
      { name: "claimed", type: "bool" }
    ]
  },
  {
    type: "function",
    name: "getReplicaEntryCipher",
    stateMutability: "view",
    inputs: [
      { name: "seriesId", type: "string" },
      { name: "user", type: "address" }
    ],
    outputs: [{ name: "", type: "bytes32" }]
  },
  {
    type: "function",
    name: "getUserSeries",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "string[]" }]
  },
  {
    type: "function",
    name: "getSeriesPickCounts",
    stateMutability: "view",
    inputs: [{ name: "seriesId", type: "string" }],
    outputs: [{ name: "", type: "uint256[2]" }]
  },
  // Write functions
  {
    type: "function",
    name: "createReplicaSeries",
    stateMutability: "nonpayable",
    inputs: [
      { name: "seriesId", type: "string" },
      { name: "teamA", type: "string" },
      { name: "teamB", type: "string" },
      { name: "entryFee", type: "uint256" },
      { name: "duration", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "enterReplicaSeries",
    stateMutability: "payable",
    inputs: [
      { name: "seriesId", type: "string" },
      { name: "pick", type: "uint8" },
      { name: "encryptedConfidence", type: "bytes32" },
      { name: "inputProof", type: "bytes" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "settleReplicaSeries",
    stateMutability: "nonpayable",
    inputs: [{ name: "seriesId", type: "string" }],
    outputs: []
  },
  {
    type: "function",
    name: "cancelReplicaSeries",
    stateMutability: "nonpayable",
    inputs: [{ name: "seriesId", type: "string" }],
    outputs: []
  },
  {
    type: "function",
    name: "claimReplicaPrize",
    stateMutability: "nonpayable",
    inputs: [{ name: "seriesId", type: "string" }],
    outputs: []
  },
  {
    type: "function",
    name: "claimReplicaRefund",
    stateMutability: "nonpayable",
    inputs: [{ name: "seriesId", type: "string" }],
    outputs: []
  },
  // Events
  {
    type: "event",
    name: "SeriesCreated",
    inputs: [
      { indexed: true, name: "seriesId", type: "string" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "entryFee", type: "uint256" },
      { indexed: false, name: "lockTime", type: "uint256" }
    ]
  },
  {
    type: "event",
    name: "EntrySubmitted",
    inputs: [
      { indexed: true, name: "seriesId", type: "string" },
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "pick", type: "uint8" }
    ]
  },
  {
    type: "event",
    name: "SeriesSettled",
    inputs: [
      { indexed: true, name: "seriesId", type: "string" },
      { indexed: false, name: "winningTeam", type: "uint8" }
    ]
  },
  {
    type: "event",
    name: "SeriesCancelled",
    inputs: [{ indexed: true, name: "seriesId", type: "string" }]
  },
  {
    type: "event",
    name: "PrizeClaimed",
    inputs: [
      { indexed: true, name: "seriesId", type: "string" },
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" }
    ]
  },
  {
    type: "event",
    name: "RefundClaimed",
    inputs: [
      { indexed: true, name: "seriesId", type: "string" },
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" }
    ]
  }
] as const;
