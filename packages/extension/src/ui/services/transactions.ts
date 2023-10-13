import { BigNumberish, CallData, RawArgs, uint256 } from "starknet"

import { executeTransaction } from "./backgroundTransactions"

interface TransactionRequest {
  to: string
  method: string
  calldata: RawArgs
}

export const sendTransaction = async (data: TransactionRequest) => {
  return executeTransaction({
    transactions: {
      contractAddress: data.to,
      entrypoint: data.method,
      calldata: CallData.toCalldata(data.calldata),
    },
  })
}

// TODO: Remove ethers__BigNumber dependencies
export function getUint256CalldataFromBN(bn: BigNumberish) {
  return uint256.bnToUint256(bn)
}
