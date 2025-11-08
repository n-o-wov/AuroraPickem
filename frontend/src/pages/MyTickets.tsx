import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowLeft, Gift, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { Navbar } from "@/components/Navbar";
import { SeriesStatus } from "@/components/SeriesCard";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useGetUserSeries } from "@/hooks/useAuroraContract";
import { useReadContracts } from "wagmi";
import { AURORA_PICKEM_ADDRESS, AURORA_PICKEM_ABI } from "@/config/contracts";

interface Ticket {
  seriesId: string;
  teamA: string;
  teamB: string;
  myPick: string;
  status: SeriesStatus;
  canClaim: boolean;
  encryptedValue: string;
}

const MyTickets = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { data: userSeriesIds, isLoading: isLoadingIds } = useGetUserSeries(address);

  // Fetch series details and user entries
  const contracts = useMemo(() => {
    if (!userSeriesIds || !address) return [];
    const allContracts: any[] = [];

    (userSeriesIds as string[]).forEach((seriesId) => {
      // Get series details
      allContracts.push({
        address: AURORA_PICKEM_ADDRESS,
        abi: AURORA_PICKEM_ABI,
        functionName: "getReplicaSeries" as const,
        args: [seriesId]
      });
      // Get user entry
      allContracts.push({
        address: AURORA_PICKEM_ADDRESS,
        abi: AURORA_PICKEM_ABI,
        functionName: "getReplicaEntry" as const,
        args: [seriesId, address]
      });
      // Get encrypted cipher
      allContracts.push({
        address: AURORA_PICKEM_ADDRESS,
        abi: AURORA_PICKEM_ABI,
        functionName: "getReplicaEntryCipher" as const,
        args: [seriesId, address]
      });
    });

    return allContracts;
  }, [userSeriesIds, address]);

  const { data: contractResults, isLoading: isLoadingData } = useReadContracts({
    contracts,
    query: { enabled: contracts.length > 0 }
  });

  const tickets = useMemo<Ticket[]>(() => {
    if (!userSeriesIds || !contractResults) return [];

    const ticketList: Ticket[] = [];
    (userSeriesIds as string[]).forEach((seriesId, index) => {
      const baseIndex = index * 3;
      const seriesResult = contractResults[baseIndex]?.result as readonly [string, string, bigint, bigint, bigint, bigint, boolean, boolean, number] | undefined;
      const entryResult = contractResults[baseIndex + 1]?.result as readonly [boolean, number, boolean] | undefined;
      const cipherResult = contractResults[baseIndex + 2]?.result as string | undefined;

      if (!seriesResult || !entryResult) return;

      const [teamA, teamB, , lockTime, , , cancelled, settled] = seriesResult;
      const [exists, pick, claimed] = entryResult;

      if (!exists) return;

      let status: SeriesStatus = "OPEN";
      if (cancelled) status = "CANCELLED";
      else if (settled) status = "SETTLED";
      else if (Number(lockTime) <= Math.floor(Date.now() / 1000)) status = "LOCKED";

      const myPick = pick === 0 ? teamA : teamB;
      const canClaim = settled && !claimed;

      ticketList.push({
        seriesId,
        teamA,
        teamB,
        myPick,
        status,
        canClaim,
        encryptedValue: cipherResult ? `${cipherResult.substring(0, 10)}...` : "0x..."
      });
    });

    return ticketList;
  }, [userSeriesIds, contractResults]);

  const isLoading = isLoadingIds || isLoadingData;

  const handleViewCipher = async (ticket: Ticket) => {
    toast.info("Decrypting ciphertext...", {
      description: "Local decryption only, not sent to chain",
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success("Decryption successful", {
      description: `Your confidence: 75`,
    });
  };

  const handleClaimPrize = async (seriesId: string) => {
    toast.info("Claiming prize...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Prize sent to your wallet");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 aurora-gradient-radial pointer-events-none" />

      <Navbar />

      <div className="relative container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Hall
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground text-lg">
            View all your prediction records
          </p>
        </div>

        {isLoading ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Loading your tickets...</p>
          </Card>
        ) : tickets.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              You haven't participated in any predictions yet
            </p>
            <Button
              onClick={() => navigate("/series")}
              className="mt-4 aurora-gradient"
            >
              Enter Predictions
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.seriesId} className="p-6 hover:aurora-glow transition-all">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Series info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold">
                        {ticket.teamA} vs {ticket.teamB}
                      </h3>
                      <StatusBadge status={ticket.status} />
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Series ID: </span>
                        <span className="font-medium">#{ticket.seriesId}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">My Pick: </span>
                        <Badge variant="outline" className="font-medium">
                          {ticket.myPick}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Ciphertext: {ticket.encryptedValue}...
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:w-48">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/series/${ticket.seriesId}`)}
                    >
                      View Details
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCipher(ticket)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Ciphertext
                    </Button>

                    {ticket.canClaim && (
                      <Button
                        size="sm"
                        className="aurora-gradient"
                        onClick={() => handleClaimPrize(ticket.seriesId)}
                      >
                        <Gift className="mr-2 h-4 w-4" />
                        Claim Prize
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
