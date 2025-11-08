import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type SeriesStatus = "OPEN" | "LOCKED" | "REVEALING" | "SETTLED" | "CANCELLED";

interface SeriesCardProps {
  seriesId: string;
  teamA: string;
  teamB: string;
  deadline: Date;
  entryFee: number;
  participants: number;
  status: SeriesStatus;
  isOrganizer?: boolean;
}

const statusConfig: Record<SeriesStatus, { color: string; label: string }> = {
  OPEN: { color: "bg-status-open", label: "Open" },
  LOCKED: { color: "bg-status-locked", label: "Locked" },
  REVEALING: { color: "bg-status-revealing", label: "Revealing" },
  SETTLED: { color: "bg-status-settled", label: "Settled" },
  CANCELLED: { color: "bg-status-cancelled", label: "Cancelled" },
};

export const SeriesCard = ({
  seriesId,
  teamA,
  teamB,
  deadline,
  entryFee,
  participants,
  status,
  isOrganizer,
}: SeriesCardProps) => {
  const now = new Date();
  const timeLeft = Math.max(deadline.getTime() - now.getTime(), 0);
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const statusInfo = statusConfig[status];

  return (
    <Link to={`/series/${seriesId}`}>
      <Card className="group relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg hover:aurora-glow cursor-pointer">
        <div className="absolute inset-0 aurora-gradient-radial opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">#{seriesId}</div>
              <h3 className="text-xl font-semibold">
                {teamA} <span className="text-muted-foreground">vs</span> {teamB}
              </h3>
            </div>
            <Badge className={cn("font-medium", statusInfo.color)}>
              {statusInfo.label}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-foreground font-medium">
                  {hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`}
                </div>
                <div className="text-xs text-muted-foreground">Time Remaining</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-foreground font-medium">{entryFee} ETH</div>
                <div className="text-xs text-muted-foreground">Entry Fee</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-foreground font-medium">{participants}</div>
                <div className="text-xs text-muted-foreground">Participants</div>
              </div>
            </div>
          </div>

          {/* CTA hint */}
          <div className="pt-2 border-t border-border">
            <div className="text-sm text-primary group-hover:text-accent transition-colors">
              {isOrganizer ? "Manage Series →" : "Enter Prediction →"}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
