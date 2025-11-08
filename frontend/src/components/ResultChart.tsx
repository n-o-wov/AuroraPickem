import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultChartProps {
  teamA: string;
  teamB: string;
  revealedA: number;
  revealedB: number;
  isDraw?: boolean;
}

export const ResultChart = ({ teamA, teamB, revealedA, revealedB, isDraw }: ResultChartProps) => {
  const total = revealedA + revealedB;
  const percentA = total > 0 ? (revealedA / total) * 100 : 50;
  const percentB = total > 0 ? (revealedB / total) * 100 : 50;
  
  const winnerA = !isDraw && revealedA > revealedB;
  const winnerB = !isDraw && revealedB > revealedA;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Results Revealed</h3>
        {isDraw && (
          <div className="text-sm text-status-settled flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Draw - Refund Prize
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Team A */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{teamA}</span>
              {winnerA && <Trophy className="h-5 w-5 text-status-settled" />}
            </div>
            <span className="text-2xl font-bold text-chart-teamA">
              {percentA.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-8 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full bg-chart-teamA bar-grow transition-all",
                winnerA && "aurora-glow"
              )}
              style={{ "--bar-width": `${percentA}%` } as React.CSSProperties}
            />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
              {revealedA} votes
            </div>
          </div>
        </div>

        {/* Team B */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{teamB}</span>
              {winnerB && <Trophy className="h-5 w-5 text-status-settled" />}
            </div>
            <span className="text-2xl font-bold text-chart-teamB">
              {percentB.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-8 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full bg-chart-teamB bar-grow transition-all",
                winnerB && "aurora-glow"
              )}
              style={{ "--bar-width": `${percentB}%` } as React.CSSProperties}
            />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
              {revealedB} votes
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border text-sm text-muted-foreground">
        Total votes: {total} | Encrypted weights decrypted via FHE
      </div>
    </Card>
  );
};
