import { defaultProvider } from "starknet"

import App from "./App.svelte"
import type { StarknetWindowObject } from "./extension.model"

// nextjs ie needs this to be typeof window !== "undefined" as it's replacing it in client bundles
const IS_BROWSER = typeof window !== "undefined"

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
    const fail = async () => {
      throw Error("no starknet found in window")
    }
    return {
      request: fail,
      isConnected: false,
      provider: defaultProvider,
      enable: fail,
      on: fail,
      off: fail,
    }
  }
}
