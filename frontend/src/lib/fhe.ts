import { create } from "zustand";
import { bytesToHex, getAddress } from "viem";

interface FheState {
  ready: boolean;
  initializing: boolean;
  error?: string;
  setReady: (ready: boolean) => void;
  setInitializing: (value: boolean) => void;
  setError: (error?: string) => void;
}

export const useFheStore = create<FheState>((set) => ({
  ready: false,
  initializing: false,
  error: undefined,
  setReady: (ready) => set({ ready }),
  setInitializing: (initializing) => set({ initializing }),
  setError: (error) => set({ error })
}));

let fheInstance: any = null;

const getSDK = (): any => {
  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires browser environment");
  }
  const sdk = (window as any).RelayerSDK || (window as any).relayerSDK;
  if (!sdk) {
    throw new Error("RelayerSDK not loaded. Please ensure the script tag is in your HTML.");
  }
  return sdk;
};

export const initializeFHE = async (provider?: any): Promise<any> => {
  const { setReady, setInitializing, setError } = useFheStore.getState();
  if (fheInstance) {
    setReady(true);
    return fheInstance;
  }
  try {
    setInitializing(true);
    setError(undefined);
    const sdk = getSDK();
    const { initSDK, createInstance, SepoliaConfig } = sdk;
    await initSDK();
    const ethereumProvider = provider?.getEthereumProvider
      ? await provider.getEthereumProvider()
      : provider || (window as any).ethereum;
    if (!ethereumProvider) {
      throw new Error("No Ethereum provider found");
    }
    fheInstance = await createInstance({
      ...SepoliaConfig,
      network: ethereumProvider
    });
    setReady(true);
    setInitializing(false);
    return fheInstance;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to initialize FHE";
    setError(errorMessage);
    setInitializing(false);
    throw err;
  }
};

export interface EncryptedConfidencePayload {
  handle: `0x${string}`;
  proof: `0x${string}`;
}

export const encryptConfidence = async (
  confidence: bigint,
  contractAddress: string,
  userAddress: string
): Promise<EncryptedConfidencePayload> => {
  if (!fheInstance) {
    throw new Error("FHE SDK not initialized. Call initializeFHE first.");
  }
  if (confidence <= 0n || confidence > 100n) {
    throw new Error("Confidence must be between 1 and 100");
  }
  const input = fheInstance.createEncryptedInput(
    getAddress(contractAddress),
    getAddress(userAddress)
  );
  input.add64(confidence);
  const { handles, inputProof } = await input.encrypt();
  return {
    handle: bytesToHex(handles[0]) as `0x${string}`,
    proof: bytesToHex(inputProof) as `0x${string}`
  };
};

export const getFheInstance = (): any => {
  if (!fheInstance) {
    throw new Error("FHE SDK not initialized");
  }
  return fheInstance;
};
