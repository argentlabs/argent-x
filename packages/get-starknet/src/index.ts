import App from "./App.svelte"

export const getStarknet = ({ showModal = false } = {}) => {
  if (globalThis["starknet"]) {
    return globalThis["starknet"]
  } else {
    console.log("no starknet found in window")
    if (showModal && typeof document !== "undefined") {
      new App({ target: document.body })
    }
  }
}
