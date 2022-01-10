import { defaultProvider } from "starknet"

import App from "./App.svelte"
import type { StarknetWindowObject } from "./extension.model"

// nextjs ie needs this to be typeof window !== "undefined" as it's replacing it in client bundles
const IS_BROWSER = typeof window !== "undefined"

export function getStarknet({
  showModal = false,
}: { showModal?: boolean } = {}): StarknetWindowObject {
  // if extension isnt installed (didnt populate window.starknet) polyfill it
  if (!globalThis["starknet"]) {
    const fail = async () => {
      throw Error("no starknet found in window")
    }
    globalThis["starknet"] = {
      request: fail,
      isConnected: false,
      provider: defaultProvider,
      enable: () => {
        if (IS_BROWSER && showModal) {
          new App({ target: document.body })
        }
        return fail()
      },
      on: fail,
      off: fail,
    }
  }
  return globalThis["starknet"]
}
