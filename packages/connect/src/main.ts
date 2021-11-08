import App from "./App.svelte"

const getStarknet = () => {
  if (window.starknet) {
    return window.starknet
  } else {
    console.log("no starknet found in window")
    new App({ target: document.body })
  }
}

export default getStarknet
