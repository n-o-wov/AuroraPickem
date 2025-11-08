import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useEnterSeries } from "@/hooks/useAuroraContract";
import {
  encryptConfidence,
  initializeFHE,
  useFheStore
} from "@/lib/fhe";
import { formatEther } from "viem";
import { AURORA_PICKEM_ADDRESS } from "@/config/contracts";

interface BettingPanelProps {
  seriesId: string;
  teamA: string;
  teamB: string;
  entryFeeWei: bigint;
}

export const BettingPanel = ({
  seriesId,
  teamA,
  teamB,
  entryFeeWei
}: BettingPanelProps) => {
  const [selectedPick, setSelectedPick] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(50);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { address, isConnected } = useAccount();
  const { ready, initializing, error, setError } = useFheStore();
  const { enterSeries, isPending, isConfirming } = useEnterSeries();

  useEffect(() => {
    if (isConnected && !ready && !initializing) {
      initializeFHE(window.ethereum).catch((err) => {
        console.error(err);
      });
    }
  }, [isConnected, ready, initializing]);

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect wallet first");
      return;
    }
    if (selectedPick === null) {
      toast.error("Please select a team first");
      return;
    }

    try {
      if (!ready) {
        await initializeFHE(window.ethereum);
      }

      setError(undefined);
      setIsEncrypting(true);
      toast.info("Generating FHE ciphertext...", { icon: <Shield className="h-4 w-4" /> });
      const { handle, proof } = await encryptConfidence(
        BigInt(confidence),
        AURORA_PICKEM_ADDRESS,
        address
      );
      toast.success("Ciphertext generated successfully");
      setIsEncrypting(false);

      toast.info("Submitting on-chain transaction...", { icon: <Lock className="h-4 w-4" /> });
      await enterSeries(seriesId, selectedPick, handle, proof, entryFeeWei);
      toast.success("Bet transaction sent, awaiting confirmation");
    } catch (err) {
      console.error(err);
      setIsEncrypting(false);
      toast.error("Submission failed, please try again");
    }
  };

  const isLoading = isEncrypting || isPending || isConfirming || initializing;
  const entryFeeEth = formatEther(entryFeeWei);

  return (
    <Card className="p-6 space-y-6 aurora-border">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Enter Prediction</h3>
        <p className="text-sm text-muted-foreground">
          Select your team and set confidence level
        </p>
      </div>

      <div className="space-y-3">
        <Label>Select Team</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedPick(0)}
            disabled={isLoading}
            className={cn(
              "p-4 rounded-lg border-2 transition-all",
              "hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
              selectedPick === 0
                ? "border-primary bg-primary/10 aurora-glow"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="text-center">
              <div className="text-lg font-semibold">{teamA}</div>
              <div className="text-xs text-muted-foreground mt-1">Team A</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedPick(1)}
            disabled={isLoading}
            className={cn(
              "p-4 rounded-lg border-2 transition-all",
              "hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
              selectedPick === 1
                ? "border-primary bg-primary/10 aurora-glow"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="text-center">
              <div className="text-lg font-semibold">{teamB}</div>
              <div className="text-xs text-muted-foreground mt-1">Team B</div>
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Confidence</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              max="100"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-20 text-center"
              disabled={isLoading}
            />
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
        </div>
        <Slider
          value={[confidence]}
          onValueChange={(values) => setConfidence(values[0])}
          min={1}
          max={100}
          step={1}
          disabled={isLoading}
          className="cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">
          Higher confidence indicates stronger belief in your team (only for weighting, does not affect payout)
        </p>
      </div>

      <div className="p-4 bg-muted rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Entry Fee</span>
          <span className="font-semibold">{entryFeeEth} ETH</span>
        </div>
        <div className="text-xs text-muted-foreground">
          ⚠️ Confidence will be encrypted via FHE and remain fully confidential until results are revealed
        </div>
        {error && <div className="text-xs text-destructive">FHE initialization failed: {error}</div>}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={selectedPick === null || isLoading}
        className="w-full h-12 aurora-gradient hover:opacity-90"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {isEncrypting ? "Generating ciphertext..." : "Awaiting confirmation..."}
          </>
        ) : (
          <>
            <Shield className="mr-2 h-5 w-5" />
            Generate Ciphertext and Submit
          </>
        )}
      </Button>
    </Card>
  );
};
