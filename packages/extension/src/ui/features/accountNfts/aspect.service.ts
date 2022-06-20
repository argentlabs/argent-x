import join from "url-join"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { AspectNft } from "./aspect.model"

const baseUrl = "https://api-testnet.playoasisx.com/assets"

export const fetchAspectNfts = async (
  account: BaseWalletAccount,
): Promise<AspectNft[]> => {
  if (account.networkId === "goerli-alpha") {
    const params = new URLSearchParams({ owner_address: account.address })
    const response = await fetch(join(baseUrl, `?${params}`))
    return await response.json()
  }
  return []
}

export const openAspectNft = (contractAddress: string, tokenId: string) => {
  const url = `https://testnet.aspect.co/asset/${contractAddress}/${tokenId}`
  window.open(url, "_blank")?.focus()
}

export const getNftPicture = ({ image_url, copy_image_url }: AspectNft) => {
  if (image_url && copy_image_url) {
    if (!copy_image_url.startsWith("ipfs://")) {
      return copy_image_url
    }
    if (!image_url.startsWith("ipfs://")) {
      return image_url
    }
  }
  if (copy_image_url) {
    return copy_image_url
  }
  return image_url
}
