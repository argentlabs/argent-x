import join from "url-join"

import { IPlayOasisNft } from "./playoasis.model"

const baseUrl = "https://api-testnet.playoasisx.com/assets"

export const fetchPlayOasisNfts = async (
  address: string,
): Promise<IPlayOasisNft[]> => {
  const params = new URLSearchParams({ owner_address: address })
  const response = await fetch(join(baseUrl, `?${params}`))
  return await response.json()
}

export const openPlayOasisNft = (contractAddress: string, tokenId: string) => {
  const url = `https://testnet.playoasis.xyz/asset/${contractAddress}/${tokenId}`
  window.open(url, "_blank")?.focus()
}
