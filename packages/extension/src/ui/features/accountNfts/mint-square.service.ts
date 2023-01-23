import { number } from "starknet"

export const openMintSquareNft = (
  contractAddress: string,
  tokenId: string,
  networkId: string,
) => {
  // Need this as MintSquare doesn't support hex string with padded 0s.
  // For example, contractAddress: 0x023432.... is not equal to 0x23432...
  // MintSquare will only be able to load the second address.
  const parsedContractAddress = number.toHex(number.toBigInt(contractAddress))

  const url =
    networkId === "goerli-alpha"
      ? `https://mintsquare.io/asset/starknet-testnet/${parsedContractAddress}/${tokenId}`
      : `https://mintsquare.io/asset/starknet/${parsedContractAddress}/${tokenId}`
  window.open(url, "_blank")?.focus()
}
