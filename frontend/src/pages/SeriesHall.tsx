import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SeriesCard, SeriesStatus } from "@/components/SeriesCard";
import { Navbar } from "@/components/Navbar";
import { CreateSeriesDialog } from "@/components/CreateSeriesDialog";
import { Plus, Filter, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListSeries } from "@/hooks/useAuroraContract";
import { useReadContracts } from "wagmi";
import { AURORA_PICKEM_ABI, AURORA_PICKEM_ADDRESS } from "@/config/contracts";
import { formatEther } from "viem";

interface SeriesSummary {
  seriesId: string;
  teamA: string;
  teamB: string;
  deadline: Date;
  entryFee: number;
  participants: number;
  status: SeriesStatus;
}

const SeriesHall = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: seriesIds, isLoading: isLoadingIds } = useListSeries();

  const contracts = useMemo(
    () =>
      (seriesIds ?? []).map((seriesId) => ({
        address: AURORA_PICKEM_ADDRESS,
        abi: AURORA_PICKEM_ABI,
        functionName: "getReplicaSeries" as const,
        args: [seriesId]
      })),
    [seriesIds]
  );

  const { data: seriesResults, isLoading: isLoadingSeries } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0
    }
  });

  const mappedSeries = useMemo<SeriesSummary[]>(() => {
    if (!seriesIds || !seriesResults) return [];
    return seriesIds
      .map((seriesId, index) => {
        const result = seriesResults[index]?.result as
          | readonly [string, string, bigint, bigint, bigint, bigint, boolean, boolean, number]
          | undefined;

        if (!result) return null;

        const [teamA, teamB, entryFee, lockTime, , entryCount, cancelled, settled] = result;
        const deadline = new Date(Number(lockTime) * 1000);

        let status: SeriesStatus = "OPEN";
        if (cancelled) status = "CANCELLED";
        else if (settled) status = "SETTLED";
        else if (Number(lockTime) <= Math.floor(Date.now() / 1000)) status = "LOCKED";

        return {
          seriesId,
          teamA,
          teamB,
          deadline,
          entryFee: Number(formatEther(entryFee)),
          participants: Number(entryCount),
          status
        };
      })
      .filter((item): item is SeriesSummary => Boolean(item));
  }, [seriesIds, seriesResults]);

  const filteredSeries = mappedSeries.filter((series) => {
    if (statusFilter !== "all" && series.status !== statusFilter) return false;
    if (sportFilter !== "all" && !series.seriesId.startsWith(sportFilter)) return false;
    return true;
  });

  const isLoading = isLoadingIds || (contracts.length > 0 && isLoadingSeries);

  return (
    <div className="min-h-screen bg-background">
      {/* Aurora background effect */}
      <div className="fixed inset-0 aurora-gradient-radial pointer-events-none" />
      
      <Navbar />
      
      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Aurora Pick'em
              </h1>
              <p className="text-muted-foreground text-lg">
                Private Predictions, Fair Payouts | Powered by FHE
              </p>
            </div>
            <Button
              size="lg"
              className="aurora-gradient hover:opacity-90"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Series
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg aurora-border">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="LOCKED">Locked</SelectItem>
                <SelectItem value="REVEALING">Revealing</SelectItem>
                <SelectItem value="SETTLED">Settled</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sport Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="NBA">NBA</SelectItem>
                <SelectItem value="NFL">NFL</SelectItem>
                <SelectItem value="MLB">MLB</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto text-sm text-muted-foreground">
              Total {filteredSeries.length} Series
            </div>
          </div>
        </div>

        {/* Series Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSeries.map((series) => (
            <SeriesCard key={series.seriesId} {...series} />
          ))}
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Syncing series data...</p>
          </div>
        )}

        {!isLoading && filteredSeries.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No matching series found</p>
          </div>
        )}
      </div>

      <CreateSeriesDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
};

export default SeriesHall;
