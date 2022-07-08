import join from "url-join"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { AspectNft } from "./aspect.model"

export const baseUrl = "https://api-testnet.aspect.co/api/v0/assets"

export const fetchAspectNfts = async (
  account: BaseWalletAccount,
  url: string,
): Promise<AspectNft[]> => {
  if (account.networkId === "goerli-alpha") {
    const params = new URLSearchParams({ owner_address: account.address })
    const response = await fetch(join(url, `?${params}`, "&limit=50"))
    const data = await response.json()

    if (data.next_url) {
      return data.assets.concat(await fetchAspectNfts(account, data.next_url))
    }
    return data.assets
  }
  return []
}

export const openAspectNft = (contractAddress: string, tokenId: string) => {
  const url = `https://testnet.aspect.co/asset/${contractAddress}/${tokenId}`
  window.open(url, "_blank")?.focus()
}

export const getNftPicture = ({ image_uri, image_url_copy }: AspectNft) => {
  if (image_uri && image_url_copy) {
    if (!image_url_copy.startsWith("ipfs://")) {
      return image_url_copy
    }
    if (!image_uri.startsWith("ipfs://")) {
      return image_uri
    }
  }
  if (image_url_copy) {
    return image_url_copy
  }
  return image_uri
}
