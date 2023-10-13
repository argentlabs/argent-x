import { normalizeAddress } from "../../services/addresses"

export const getLayerSwapUrl = (accountAddress: string) => {
  return `https://www.layerswap.io/?destNetwork=STARKNET_MAINNET&destAddress=${normalizeAddress(
    accountAddress,
  )}&lockNetwork=true&lockAddress=true&addressSource=argentx`
}
