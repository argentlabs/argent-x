// just using types here
// eslint-disable-next-line @argent/local/code-import-patterns
import type { LogoDeprecatedKeys } from "@argent/x-ui"

export interface BlockExplorer {
  title: string
  logo: LogoDeprecatedKeys
  url: Record<string, string>
  campaignParams: string
}

export type BlockExplorers = Record<string, BlockExplorer>

export const defaultBlockExplorers: BlockExplorers = {
  starkScan: {
    title: "StarkScan",
    logo: "StarknetLogo",
    url: {
      "mainnet-alpha": "https://starkscan.co",
      "sepolia-alpha": "https://sepolia.starkscan.co",
      localhost: "https://devnet.starkscan.co",
    },
    campaignParams: "",
  },
  voyager: {
    title: "Voyager",
    logo: "VoyagerLogo",
    url: {
      "mainnet-alpha": "https://voyager.online",
      "sepolia-alpha": "https://sepolia.voyager.online",
      localhost: "https://sepolia.voyager.online/local-version",
    },
    campaignParams:
      "?mtm_campaign=argent-redirect&mtm_source=argent&mtm_medium=referral",
  },
} as const

export type BlockExplorerKey = keyof typeof defaultBlockExplorers

export const defaultBlockExplorerKey: BlockExplorerKey = "voyager"
