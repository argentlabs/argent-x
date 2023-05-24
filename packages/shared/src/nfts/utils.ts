export const openAspectNft = (
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

interface GetNftPictureProps {
  image_uri?: string
  image_url_copy?: string
}

export const getNftPicture = ({
  image_uri,
  image_url_copy,
}: GetNftPictureProps) => {
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
