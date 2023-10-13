import { CallData } from "starknet"

import {
  getUint256CalldataFromBN,
  parseAmountValue,
} from "../utils/parseAmount"

const erc20TransferTransaction = (
  contractAddress: string,
  recipient: string,
  amount: string,
  decimals: number,
) => ({
  contractAddress,
  entrypoint: "transfer",
  calldata: CallData.compile({
    recipient,
    amount: getUint256CalldataFromBN(parseAmountValue(amount, decimals)),
  }),
})

const erc721TransferFromTransaction = (
  contractAddress: string,
  from: string,
  recipient: string,
  tokenId: string,
) => ({
  contractAddress,
  entrypoint: "transferFrom",
  calldata: CallData.compile({
    from_: from,
    to: recipient,
    tokenId: getUint256CalldataFromBN(tokenId), // OZ specs need a uint256 as tokenId
  }),
})

const erc721SafeTransferFromTransaction = (
  contractAddress: string,
  from: string,
  recipient: string,
  tokenId: string,
) => ({
  contractAddress,
  entrypoint: "safeTransferFrom",
  calldata: CallData.compile({
    from_: from,
    to: recipient,
    tokenId: getUint256CalldataFromBN(tokenId),
    amount: getUint256CalldataFromBN(1),
    data_len: "0",
  }),
})

export {
  erc20TransferTransaction,
  erc721TransferFromTransaction,
  erc721SafeTransferFromTransaction,
}
