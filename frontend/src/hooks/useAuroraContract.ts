import { useEffect } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { AURORA_PICKEM_ADDRESS, AURORA_PICKEM_ABI } from "@/config/contracts";
import { toast } from "sonner";
import type { Address } from "viem";

// Read hooks
export const useListSeries = () => {
  return useReadContract({
    address: AURORA_PICKEM_ADDRESS,
    abi: AURORA_PICKEM_ABI,
    functionName: "listReplicaSeries"
  });
};

export const useGetSeries = (seriesId?: string) => {
  const enabled = Boolean(seriesId);
  return useReadContract({
    address: AURORA_PICKEM_ADDRESS,
    abi: AURORA_PICKEM_ABI,
    functionName: "getReplicaSeries",
    args: enabled ? [seriesId as string] : undefined,
    query: {
      enabled
    }
  });
};

export const useGetEntrants = (seriesId?: string) => {
  const enabled = Boolean(seriesId);
  return useReadContract({
    address: AURORA_PICKEM_ADDRESS,
    abi: AURORA_PICKEM_ABI,
    functionName: "getReplicaEntrants",
    args: enabled ? [seriesId as string] : undefined,
    query: { enabled }
  });
};

export const useGetEntry = (seriesId?: string, userAddress?: Address) => {
  const enabled = Boolean(seriesId && userAddress);
  return useReadContract({
    address: AURORA_PICKEM_ADDRESS,
    abi: AURORA_PICKEM_ABI,
    functionName: "getReplicaEntry",
    args: enabled ? ([seriesId as string, userAddress as Address] as const) : undefined,
    query: { enabled }
  });
};

export const useGetEntryCipher = (seriesId?: string, userAddress?: Address) => {
  const enabled = Boolean(seriesId && userAddress);
  return useReadContract({
    address: AURORA_PICKEM_ADDRESS,
    abi: AURORA_PICKEM_ABI,
    functionName: "getReplicaEntryCipher",
    args: enabled ? ([seriesId as string, userAddress as Address] as const) : undefined,
    query: { enabled }
  });
};

export const useGetUserSeries = (userAddress?: Address) => {
  const enabled = Boolean(userAddress);
  return useReadContract({
    address: AURORA_PICKEM_ADDRESS,
    abi: AURORA_PICKEM_ABI,
    functionName: "getUserSeries",
    args: enabled ? [userAddress as Address] : undefined,
    query: { enabled }
  });
};

export const useGetPickCounts = (seriesId?: string) => {
  const enabled = Boolean(seriesId);
  return useReadContract({
    address: AURORA_PICKEM_ADDRESS,
    abi: AURORA_PICKEM_ABI,
    functionName: "getSeriesPickCounts",
    args: enabled ? [seriesId as string] : undefined,
    query: { enabled }
  });
};

export const useMinEntryFee = () => {
  return useReadContract({
    address: AURORA_PICKEM_ADDRESS,
    abi: AURORA_PICKEM_ABI,
    functionName: "MIN_ENTRY_FEE"
  });
};

// Write hooks
export const useCreateSeries = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createSeries = async (
    seriesId: string,
    teamA: string,
    teamB: string,
    entryFee: bigint,
    duration: bigint
  ) => {
    try {
      writeContract({
        address: AURORA_PICKEM_ADDRESS,
        abi: AURORA_PICKEM_ABI,
        functionName: "createReplicaSeries",
        args: [seriesId, teamA, teamB, entryFee, duration]
      });
    } catch (err) {
      toast.error("Failed to create series");
      throw err;
    }
  };

  return { createSeries, hash, error, isPending, isConfirming, isSuccess };
};

export const useEnterSeries = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && hash) {
      toast.success("Transaction confirmed!", {
        description: "Your transaction has been confirmed on-chain",
        action: {
          label: "View on Etherscan →",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank')
        },
        duration: 5000
      });
    }
  }, [isSuccess, hash]);

  useEffect(() => {
    if (error) {
      toast.error("Transaction failed", {
        description: error?.message || "Please try again",
        duration: 5000
      });
    }
  }, [error]);

  const enterSeries = async (
    seriesId: string,
    pick: number,
    encryptedConfidence: `0x${string}`,
    proof: `0x${string}`,
    entryFee: bigint
  ) => {
    try {
      writeContract({
        address: AURORA_PICKEM_ADDRESS,
        abi: AURORA_PICKEM_ABI,
        functionName: "enterReplicaSeries",
        args: [seriesId, pick, encryptedConfidence, proof],
        value: entryFee
      });
    } catch (err) {
      toast.error("Failed to enter series");
      throw err;
    }
  };

  return { enterSeries, hash, error, isPending, isConfirming, isSuccess };
};

export const useSettleSeries = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && hash) {
      toast.success("Transaction confirmed!", {
        description: "Your transaction has been confirmed on-chain",
        action: {
          label: "View on Etherscan →",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank')
        },
        duration: 5000
      });
    }
  }, [isSuccess, hash]);

  useEffect(() => {
    if (error) {
      toast.error("Transaction failed", {
        description: error?.message || "Please try again",
        duration: 5000
      });
    }
  }, [error]);

  const settleSeries = async (seriesId: string) => {
    try {
      writeContract({
        address: AURORA_PICKEM_ADDRESS,
        abi: AURORA_PICKEM_ABI,
        functionName: "settleReplicaSeries",
        args: [seriesId]
      });
    } catch (err) {
      toast.error("Failed to settle series");
      throw err;
    }
  };

  return { settleSeries, hash, error, isPending, isConfirming, isSuccess };
};

export const useCancelSeries = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && hash) {
      toast.success("Transaction confirmed!", {
        description: "Your transaction has been confirmed on-chain",
        action: {
          label: "View on Etherscan →",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank')
        },
        duration: 5000
      });
    }
  }, [isSuccess, hash]);

  useEffect(() => {
    if (error) {
      toast.error("Transaction failed", {
        description: error?.message || "Please try again",
        duration: 5000
      });
    }
  }, [error]);

  const cancelSeries = async (seriesId: string) => {
    try {
      writeContract({
        address: AURORA_PICKEM_ADDRESS,
        abi: AURORA_PICKEM_ABI,
        functionName: "cancelReplicaSeries",
        args: [seriesId]
      });
    } catch (err) {
      toast.error("Failed to cancel series");
      throw err;
    }
  };

  return { cancelSeries, hash, error, isPending, isConfirming, isSuccess };
};

export const useClaimPrize = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && hash) {
      toast.success("Transaction confirmed!", {
        description: "Your transaction has been confirmed on-chain",
        action: {
          label: "View on Etherscan →",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank')
        },
        duration: 5000
      });
    }
  }, [isSuccess, hash]);

  useEffect(() => {
    if (error) {
      toast.error("Transaction failed", {
        description: error?.message || "Please try again",
        duration: 5000
      });
    }
  }, [error]);

  const claimPrize = async (seriesId: string) => {
    try {
      writeContract({
        address: AURORA_PICKEM_ADDRESS,
        abi: AURORA_PICKEM_ABI,
        functionName: "claimReplicaPrize",
        args: [seriesId]
      });
    } catch (err) {
      toast.error("Failed to claim prize");
      throw err;
    }
  };

  return { claimPrize, hash, error, isPending, isConfirming, isSuccess };
};

export const useClaimRefund = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && hash) {
      toast.success("Transaction confirmed!", {
        description: "Your transaction has been confirmed on-chain",
        action: {
          label: "View on Etherscan →",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank')
        },
        duration: 5000
      });
    }
  }, [isSuccess, hash]);

  useEffect(() => {
    if (error) {
      toast.error("Transaction failed", {
        description: error?.message || "Please try again",
        duration: 5000
      });
    }
  }, [error]);

  const claimRefund = async (seriesId: string) => {
    try {
      writeContract({
        address: AURORA_PICKEM_ADDRESS,
        abi: AURORA_PICKEM_ABI,
        functionName: "claimReplicaRefund",
        args: [seriesId]
      });
    } catch (err) {
      toast.error("Failed to claim refund");
      throw err;
    }
  };

  return { claimRefund, hash, error, isPending, isConfirming, isSuccess };
};
