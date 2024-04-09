// just using types here
// eslint-disable-next-line @argent/local/code-import-patterns
import { logos } from "@argent/x-ui"

export interface BlockExplorer {
  title: string
  logo: keyof typeof logos
  url: Record<string, string>
}

export type BlockExplorers = Record<string, BlockExplorer>

export const defaultBlockExplorers: BlockExplorers = {
  starkScan: {
    title: "StarkScan",
    logo: "StarknetLogo",
    url: {
      "mainnet-alpha": "https://starkscan.co",
      "sepolia-alpha": "https://sepolia.starkscan.co",
      "goerli-alpha": "https://testnet.starkscan.co",
      localhost: "https://devnet.starkscan.co",
    },
  },
  voyager: {
    title: "Voyager",
    logo: "VoyagerLogo",
    url: {
      "mainnet-alpha": "https://voyager.online",
      "sepolia-alpha": "https://sepolia.voyager.online",
      "goerli-alpha": "https://goerli.voyager.online",
      localhost: "https://goerli.voyager.online/local-version",
    },
  },
} as const

export type BlockExplorerKey = keyof typeof defaultBlockExplorers

export const defaultBlockExplorerKey: BlockExplorerKey = "starkScan"
