import { normalizeAddress } from "@argent/x-shared"

export const getLayerSwapUrl = (accountAddress: string) => {
  return `https://www.layerswap.io/?destNetwork=STARKNET_MAINNET&destAddress=${normalizeAddress(
    accountAddress,
  )}&lockNetwork=true&lockAddress=true&addressSource=argentx`
}
