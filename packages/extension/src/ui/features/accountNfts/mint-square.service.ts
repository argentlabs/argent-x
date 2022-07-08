import { number } from "starknet"

export const openMintSquareNft = (contractAddress: string, tokenId: string) => {
  // Need this as MintSquare doesn't support hex string with padded 0s.
  // For example, contractAddress: 0x023432.... is not equal to 0x23432...
  // MintSquare will only be able to load the later address.
  const parsedContractAddress = number.toHex(number.toBN(contractAddress))

  const url = `https://mintsquare.io/asset/StarkNet-Testnet/${parsedContractAddress}/${tokenId}`
  window.open(url, "_blank")?.focus()
}
