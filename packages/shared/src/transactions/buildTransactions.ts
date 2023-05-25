import { BigNumber } from "ethers"
import { stark } from "starknet"

import { getUint256CalldataFromBN, parseAmount } from "../utils/parseAmount"

const erc20TransferTransaction = (
  contractAddress: string,
  recipient: string,
  amount: string,
  decimals: number,
) => ({
  contractAddress,
  entrypoint: "transfer",
  calldata: stark.compileCalldata({
    recipient,
    amount: getUint256CalldataFromBN(parseAmount(amount, decimals)),
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
  calldata: stark.compileCalldata({
    from_: from,
    to: recipient,
    tokenId: getUint256CalldataFromBN(BigNumber.from(tokenId)), // OZ specs need a uint256 as tokenId
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
  calldata: stark.compileCalldata({
    from_: from,
    to: recipient,
    tokenId: getUint256CalldataFromBN(BigNumber.from(tokenId)),
    amount: getUint256CalldataFromBN(BigNumber.from(1)),
    data_len: "0",
  }),
})

export {
  erc20TransferTransaction,
  erc721TransferFromTransaction,
  erc721SafeTransferFromTransaction,
}
