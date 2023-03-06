export const defaultBlockExplorers = {
  starkScan: {
    title: "StarkScan",
    url: {
      "mainnet-alpha": "https://starkscan.co",
      "goerli-alpha": "https://testnet.starkscan.co",
      "goerli-alpha-2": "https://testnet-2.starkscan.co",
      localhost: "https://devnet.starkscan.co",
    },
  },
  voyager: {
    title: "Voyager",
    url: {
      "mainnet-alpha": "https://voyager.online",
      "goerli-alpha": "https://goerli.voyager.online",
      "goerli-alpha-2": "https://goerli-2.voyager.online",
      localhost: "https://goerli.voyager.online/local-version",
    },
  },
}

export type BlockExplorerKey = keyof typeof defaultBlockExplorers

export const defaultBlockExplorerKey: BlockExplorerKey = "starkScan"
