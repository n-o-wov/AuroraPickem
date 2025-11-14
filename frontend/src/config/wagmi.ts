import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Aurora Pick'em",
  projectId: "c5e3b3c3e8f3c5e3b3c3e8f3c5e3b3c3", // WalletConnect Project ID
  chains: [sepolia],
  transports: {
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com")
  },
  ssr: false
});
