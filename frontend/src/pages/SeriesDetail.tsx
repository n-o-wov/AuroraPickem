import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BettingPanel } from "@/components/BettingPanel";
import { StatusTimeline } from "@/components/StatusTimeline";
import { ResultChart } from "@/components/ResultChart";
import { StatusBadge } from "@/components/StatusBadge";
import { Navbar } from "@/components/Navbar";
import { SeriesStatus } from "@/components/SeriesCard";
import { ArrowLeft, Eye, X, Gift, RefreshCw, Undo } from "lucide-react";
import { useAccount } from "wagmi";
import {
  useGetSeries,
  useGetPickCounts,
  useGetEntry,
  useSettleSeries,
  useCancelSeries,
  useClaimPrize,
  useClaimRefund
} from "@/hooks/useAuroraContract";
import { formatEther } from "viem";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const resolveStatus = (
  cancelled: boolean,
  settled: boolean,
  lockTime: bigint
): SeriesStatus => {
  if (cancelled) return "CANCELLED";
  if (settled) return "SETTLED";
  if (Number(lockTime) <= Math.floor(Date.now() / 1000)) return "LOCKED";
  return "OPEN";
};

const SeriesDetail = () => {
  const { id } = useParams();
  const seriesId = id || "";
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();

  const {
    data: series,
    isLoading: isSeriesLoading
  } = useGetSeries(seriesId);
  const { data: pickCounts } = useGetPickCounts(seriesId);
  const { data: entry } = useGetEntry(seriesId, address);

  const { settleSeries, isPending: isSettling } = useSettleSeries();
  const { cancelSeries, isPending: isCancelling } = useCancelSeries();
  const { claimPrize, isPending: isClaimingPrize } = useClaimPrize();
  const { claimRefund, isPending: isClaimingRefund } = useClaimRefund();

  const details = useMemo(() => {
    if (!series) return null;
    const [
      teamA,
      teamB,
      entryFee,
      lockTime,
      prizePool,
      entryCount,
      cancelled,
      settled,
      winningTeam
    ] = series as [
      string,
      string,
      bigint,
      bigint,
      bigint,
      bigint,
      boolean,
      boolean,
      number
    ];

    const status = resolveStatus(cancelled, settled, lockTime);
    const deadline = new Date(Number(lockTime) * 1000);

    return {
      teamA,
      teamB,
      entryFee,
      lockTime,
      prizePool,
      entryCount,
      cancelled,
      settled,
      winningTeam,
      status,
      deadline
    };
  }, [series]);

  const userHasEntry = Boolean(entry?.[0]);
  const userPick = typeof entry?.[1] === "number" ? entry?.[1] : undefined;
  const entryClaimed = Boolean(entry?.[2]);
  const isWinner =
    userHasEntry &&
    details?.status === "SETTLED" &&
    userPick !== undefined &&
    details.winningTeam === userPick + 1 &&
    !entryClaimed;
  const canRefund =
    userHasEntry &&
    !entryClaimed &&
    details &&
    (details.status === "CANCELLED" ||
      (details.status === "SETTLED" && details.winningTeam === 3));

  const revealedA = Number(pickCounts?.[0] || 0n);
  const revealedB = Number(pickCounts?.[1] || 0n);

  const handleSettleSeries = async () => {
    if (!seriesId) return;
    try {
      await settleSeries(seriesId);
      toast.info("Settlement transaction sent, awaiting on-chain confirmation");
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelSeries = async () => {
    if (!seriesId) return;
    try {
      await cancelSeries(seriesId);
      toast.info("Cancellation transaction sent");
    } catch (error) {
      console.error(error);
    }
  };

  const handleClaimPrize = async () => {
    if (!seriesId) return;
    try {
      await claimPrize(seriesId);
      toast.success("Prize claim transaction submitted");
    } catch (error) {
      console.error(error);
    }
  };

  const handleClaimRefund = async () => {
    if (!seriesId) return;
    try {
      await claimRefund(seriesId);
      toast.success("Refund transaction submitted");
    } catch (error) {
      console.error(error);
    }
  };

  if (!seriesId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Series ID not found
        </div>
      </div>
    );
  }

  if (isSeriesLoading || !details) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin" />
          Loading series details...
        </div>
      </div>
    );
  }

  const entryFeeEth = formatEther(details.entryFee);
  const prizePoolEth = formatEther(details.prizePool);

  return (
    <div className="min-h-screen bg-background">
      {/* Aurora background */}
      <div className="fixed inset-0 aurora-gradient-radial pointer-events-none" />

      <Navbar />

      <div className="relative container mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Hall
        </Button>

        {/* Header */}
        <Card className="p-8 mb-8 aurora-border overflow-hidden relative">
          <div className="absolute inset-0 aurora-gradient opacity-20" />

          <div className="relative space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-2">#{seriesId}</div>
                <h1 className="text-4xl font-bold mb-4">
                  {details.teamA}
                  <span className="text-muted-foreground mx-4">VS</span>
                  {details.teamB}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Participants: {Number(details.entryCount)} | Prize Pool: {prizePoolEth} ETH
                </p>
              </div>
              <StatusBadge status={details.status} />
            </div>

            {(details.status === "LOCKED" || details.status === "SETTLED") && (
              <div className="flex items-center gap-8 text-muted-foreground text-sm">
                Deadline: {details.deadline.toLocaleString()}
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Betting panel */}
            {details.status === "OPEN" && (!userHasEntry || !isConnected) && (
              <BettingPanel
                seriesId={seriesId}
                teamA={details.teamA}
                teamB={details.teamB}
                entryFeeWei={details.entryFee}
              />
            )}

            {/* Result chart */}
            {(details.status === "LOCKED" || details.status === "SETTLED") && (
              <ResultChart
                teamA={details.teamA}
                teamB={details.teamB}
                revealedA={revealedA}
                revealedB={revealedB}
                isDraw={details.winningTeam === 3}
              />
            )}

            {/* Actions */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Actions</h3>

              <div className="space-y-3">
                {isWinner && (
                  <Button
                    onClick={handleClaimPrize}
                    className="w-full aurora-gradient"
                    size="lg"
                    disabled={isClaimingPrize}
                  >
                    {isClaimingPrize ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Gift className="mr-2 h-5 w-5" />
                        Claim Prize
                      </>
                    )}
                  </Button>
                )}

                {canRefund && (
                  <Button
                    onClick={handleClaimRefund}
                    className="w-full"
                    variant="outline"
                    size="lg"
                    disabled={isClaimingRefund}
                  >
                    {isClaimingRefund ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      <>
                        <Undo className="mr-2 h-5 w-5" />
                        Request Refund
                      </>
                    )}
                  </Button>
                )}

                {/* Public actions */}
                {details.status === "LOCKED" && (
                  <Button
                    onClick={handleSettleSeries}
                    className="w-full aurora-gradient"
                    size="lg"
                    disabled={isSettling}
                  >
                    {isSettling ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Settling...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Execute Settlement
                      </>
                    )}
                  </Button>
                )}

                {(details.status === "OPEN" || details.status === "LOCKED") && (
                  <Button
                    onClick={handleCancelSeries}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <X className="mr-2 h-5 w-5" />
                        Cancel Series
                      </>
                    )}
                  </Button>
                )}

                {details.status === "LOCKED" && (
                  <div className="text-xs text-muted-foreground">
                    ⚠️ Anyone can trigger settlement or cancellation (if no participants).
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div>
            <Card className="p-6 mb-6">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Entry Fee</div>
                <div className="text-3xl font-bold">{entryFeeEth} ETH</div>
                <div className="text-sm text-muted-foreground">
                  Your confidence will be encrypted and stored on-chain
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <StatusTimeline currentStatus={details.status} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;
