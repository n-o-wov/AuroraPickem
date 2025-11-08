import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SeriesStatus } from "./SeriesCard";

interface StatusBadgeProps {
  status: SeriesStatus;
  className?: string;
}

const statusConfig: Record<SeriesStatus, { color: string; label: string; bg: string }> = {
  OPEN: {
    color: "text-status-open",
    label: "Open",
    bg: "bg-status-open/10 border-status-open/30"
  },
  LOCKED: {
    color: "text-status-locked",
    label: "Locked",
    bg: "bg-status-locked/10 border-status-locked/30"
  },
  REVEALING: {
    color: "text-status-revealing",
    label: "Revealing",
    bg: "bg-status-revealing/10 border-status-revealing/30"
  },
  SETTLED: {
    color: "text-status-settled",
    label: "Settled",
    bg: "bg-status-settled/10 border-status-settled/30"
  },
  CANCELLED: {
    color: "text-status-cancelled",
    label: "Cancelled",
    bg: "bg-status-cancelled/10 border-status-cancelled/30"
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline"
      className={cn(config.bg, config.color, "border font-medium", className)}
    >
      {config.label}
    </Badge>
  );
};
