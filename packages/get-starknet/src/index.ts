import { Provider, Signer, defaultProvider } from "starknet"

import App from "./App.svelte"

// nextjs ie needs this to be typeof window !== "undefined" as it's replacing it in client bundles
const IS_BROWSER = typeof window !== "undefined"

type StarknetWindowObject =
  | {
      enable: () => Promise<string[]>
      signer: Signer
      provider: Provider
      selectedAddress: string
      isConnected: true
    }
  | {
      enable: () => Promise<string[]>
      signer?: Signer
      provider: Provider
      selectedAddress?: string
      isConnected: false
    }

export function getStarknet({
  showModal = false,
}: { showModal?: boolean } = {}): StarknetWindowObject {
  if (globalThis["starknet"]) {
    return globalThis["starknet"]
  } else {
    console.log("no starknet found in window")
    if (IS_BROWSER && showModal) {
      new App({ target: document.body })
    }
    return {
      isConnected: false,
      enable: async () => {
        throw Error("no starknet found in window")
      },
      provider: defaultProvider,
    }
  }
}
