import { useReadContract } from "wagmi";
import { AURORA_PICKEM_ADDRESS, AURORA_PICKEM_ABI } from "@/config/contracts";

const TestRead = () => {
  const { data: seriesIds, isLoading, error, isSuccess } = useReadContract({
    address: AURORA_PICKEM_ADDRESS,
    abi: AURORA_PICKEM_ABI,
    functionName: "listReplicaSeries"
  });

  console.log("Contract Address:", AURORA_PICKEM_ADDRESS);
  console.log("Series IDs:", seriesIds);
  console.log("Is Loading:", isLoading);
  console.log("Error:", error);
  console.log("Is Success:", isSuccess);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Contract Read Test</h1>

      <div className="space-y-4">
        <div className="p-4 bg-card rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Contract Address:</p>
          <p className="font-mono text-sm">{AURORA_PICKEM_ADDRESS}</p>
        </div>

        <div className="p-4 bg-card rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Status:</p>
          <p>{isLoading ? "Loading..." : isSuccess ? "Success" : "Idle"}</p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Error:</p>
            <p className="text-destructive text-sm">{error.message}</p>
          </div>
        )}

        <div className="p-4 bg-card rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Series IDs:</p>
          {seriesIds ? (
            <ul className="space-y-1">
              {(seriesIds as string[]).map((id: string) => (
                <li key={id} className="font-mono text-sm">{id}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No data</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestRead;
