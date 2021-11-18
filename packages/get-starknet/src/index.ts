import { defaultProvider } from "starknet"
import type { Provider, Signer } from "starknet"

import App from "./App.svelte"

// nextjs ie needs this to be typeof window !== "undefined" as it's replacing it in client bundles
const IS_BROWSER = typeof window !== "undefined"

interface RpcMessage {
  method: string
  params?: unknown[] | object
}

type StarknetWindowObject =
  | {
      request: (call: RpcMessage) => Promise<unknown>
      enable: () => Promise<string[]>
      signer: Signer
      provider: Provider
      selectedAddress: string
      isConnected: true
    }
  | {
      request: (call: RpcMessage) => Promise<unknown>
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
      request: async () => {
        throw new Error("no starknet found in window")
      },
      enable: async () => {
        throw new Error("no starknet found in window")
      },
      provider: defaultProvider,
    }
  }
}
