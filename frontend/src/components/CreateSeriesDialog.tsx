import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSeries } from "@/hooks/useAuroraContract";
import { parseEther } from "viem";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateSeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateSeriesDialog = ({ open, onOpenChange }: CreateSeriesDialogProps) => {
  const [seriesId, setSeriesId] = useState("");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [entryFee, setEntryFee] = useState("0.01");
  const [durationDays, setDurationDays] = useState("7");

  const { createSeries, isPending, isConfirming, isSuccess } = useCreateSeries();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!seriesId || !teamA || !teamB || !entryFee || !durationDays) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const entryFeeWei = parseEther(entryFee);
      const durationSeconds = BigInt(parseInt(durationDays) * 24 * 60 * 60);

      await createSeries(seriesId, teamA, teamB, entryFeeWei, durationSeconds);

      toast.success("Series creation initiated", {
        description: "Please wait for transaction confirmation"
      });
    } catch (err: any) {
      console.error("Create series error:", err);
      toast.error("Failed to create series", {
        description: err?.message || "Please try again"
      });
    }
  };

  // Close dialog on success
  if (isSuccess) {
    setTimeout(() => {
      onOpenChange(false);
      // Reset form
      setSeriesId("");
      setTeamA("");
      setTeamB("");
      setEntryFee("0.01");
      setDurationDays("7");
    }, 1000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Series</DialogTitle>
          <DialogDescription>
            Create a new prediction series. Set the teams, entry fee, and duration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seriesId">Series ID</Label>
            <Input
              id="seriesId"
              placeholder="NBA-2024-GAME-001"
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value)}
              disabled={isPending || isConfirming}
            />
            <p className="text-xs text-muted-foreground">Unique identifier for this series</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teamA">Team A</Label>
              <Input
                id="teamA"
                placeholder="Lakers"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                disabled={isPending || isConfirming}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamB">Team B</Label>
              <Input
                id="teamB"
                placeholder="Warriors"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                disabled={isPending || isConfirming}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryFee">Entry Fee (ETH)</Label>
              <Input
                id="entryFee"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="0.01"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                disabled={isPending || isConfirming}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="30"
                placeholder="7"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                disabled={isPending || isConfirming}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending || isConfirming}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? "Waiting for signature..." : "Confirming..."}
                </>
              ) : (
                "Create Series"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
