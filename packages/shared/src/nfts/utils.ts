import { NftItem } from "./interface"
import { isEqualAddress } from "../chains"

const BASE_URL = "https://unframed.co/_next/image"

type AllowedWidths =
  | 256
  | 384
  | 640
  | 750
  | 828
  | 1080
  | 1200
  | 1920
  | 2048
  | 3840

const getLambdaUrl = (uri: string, w: AllowedWidths = 256, quality = 90) => {
  if (uri.startsWith("data:image")) {
    return uri
  }

  return `${BASE_URL}?url=${getSafeAbsoluteUrl(uri)}&w=${w}&q=${quality}`
}

function getSafeAbsoluteUrl(
  pathOrUrl: string,
  host: string = window.location.origin,
): string {
  try {
    return encodeURIComponent(new URL(pathOrUrl).toString())
  } catch {
    try {
      return encodeURIComponent(new URL(`${host}${pathOrUrl}`).toString())
    } catch {
      return encodeURIComponent(pathOrUrl)
    }
  }
}

export const getNftPicture = (
  { image_uri, image_url_copy }: Pick<NftItem, "image_uri" | "image_url_copy">,
  w: AllowedWidths = 256,
  quality = 90,
) => {
  if (image_uri && image_url_copy) {
    if (!image_url_copy.startsWith("ipfs://")) {
      return getLambdaUrl(image_url_copy, w, quality)
    }
    if (!image_uri.startsWith("ipfs://")) {
      return getLambdaUrl(image_uri, w, quality)
    }
  }

  if (image_url_copy) {
    return getLambdaUrl(image_url_copy, w, quality)
  }

  return image_uri ? getLambdaUrl(image_uri, w, quality) : undefined
}

export const equalNft = (a: NftItem, b: NftItem) =>
  a.token_id === b.token_id &&
  isEqualAddress(a.contract_address, b.contract_address)

export const openNft = (
  contractAddress: string,
  tokenId: string,
  networkId: string,
) => {
  return openNftOnAspect(contractAddress, tokenId, networkId)
}

export const openNftOnAspect = (
  contractAddress: string,
  tokenId: string,
  networkId: string,
) => {
  const url =
    networkId === "goerli-alpha"
      ? `https://testnet.aspect.co/asset/${contractAddress}/${tokenId}`
      : `https://aspect.co/asset/${contractAddress}/${tokenId}`
  window.open(url, "_blank")?.focus()
}

export const openNftOnUnframed = (
  contractAddress: string,
  tokenId: string,
  networkId: string,
) => {
  if (networkId !== "mainnet-alpha") {
    throw new Error("Unframed is only available on mainnet")
  }

  const url = `https://unframed.co/item/${contractAddress}/${tokenId}`

  window.open(url, "_blank")?.focus()
}

export const openNftOnFlex = (
  contractAddress: string,
  tokenId: string,
  networkId: string,
) => {
  if (networkId !== "mainnet-alpha") {
    throw new Error("Flex is only available on mainnet")
  }

  const url = `https://flexing.gg/starknet/asset/${contractAddress}/${tokenId}`

  window.open(url, "_blank")?.focus()
}
