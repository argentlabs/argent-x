import {
  NFTTransaction,
  SwapTransaction,
  TokenMintTransaction,
  TokenTransferTransaction,
  TransformedTransaction,
} from "./type"

export const isTokenTransferTransaction = (
  transaction: TransformedTransaction,
): transaction is TokenTransferTransaction => {
  const { entity, action } = transaction
  return (
    entity === "TOKEN" &&
    (action === "SEND" || action === "RECEIVE" || action === "TRANSFER")
  )
}

export const isTokenMintTransaction = (
  transaction: TransformedTransaction,
): transaction is TokenMintTransaction => {
  const { entity, action } = transaction
  return entity === "TOKEN" && action === "MINT"
}

export const isNFTTransaction = (
  transaction: TransformedTransaction,
): transaction is NFTTransaction => {
  const { entity } = transaction
  return entity === "NFT"
}

export const isSwapTransaction = (
  transaction: TransformedTransaction,
): transaction is SwapTransaction => {
  const { action } = transaction
  return action === "SWAP"
}
