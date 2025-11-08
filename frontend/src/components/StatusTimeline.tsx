import { Check, Clock, Lock, Eye, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeriesStatus } from "./SeriesCard";

interface StatusTimelineProps {
  currentStatus: SeriesStatus;
  requestId?: string;
}

const timelineSteps = [
  { status: "OPEN", label: "Created", icon: Check },
  { status: "OPEN", label: "Betting", icon: Clock },
  { status: "LOCKED", label: "Locked", icon: Lock },
  { status: "REVEALING", label: "Revealing", icon: Eye },
  { status: "SETTLED", label: "Settled", icon: Trophy },
];

const statusOrder = ["OPEN", "LOCKED", "REVEALING", "SETTLED", "CANCELLED"];

export const StatusTimeline = ({ currentStatus, requestId }: StatusTimelineProps) => {
  const currentIndex = statusOrder.indexOf(currentStatus);
  
  if (currentStatus === "CANCELLED") {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-lg">
        <div className="flex items-center gap-3 text-destructive">
          <X className="h-6 w-6" />
          <div>
            <div className="font-semibold">Series Cancelled</div>
            <div className="text-sm opacity-80">All participants can request a refund</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Status Timeline</h3>

      {currentStatus === "REVEALING" && requestId && (
        <div className="p-4 bg-status-revealing/10 border border-status-revealing/30 rounded-lg">
          <div className="flex items-center gap-2 text-status-revealing">
            <Eye className="h-5 w-5 animate-pulse" />
            <span className="font-medium">
              FHE Decrypting (Request ID: #{requestId})
            </span>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border" />
        
        <div className="space-y-4">
          {timelineSteps.map((step, index) => {
            const stepIndex = statusOrder.indexOf(step.status);
            const isCompleted = stepIndex < currentIndex;
            const isCurrent = step.status === currentStatus;
            const Icon = step.icon;

            return (
              <div key={index} className="relative flex items-start gap-4">
                <div
                  className={cn(
                    "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all",
                    isCompleted || isCurrent
                      ? "bg-primary border-primary"
                      : "bg-card border-border"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isCompleted || isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="flex-1 pt-2">
                  <div
                    className={cn(
                      "font-medium",
                      isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </div>
                  {isCurrent && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Current Status
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
