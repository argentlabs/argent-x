import { BigNumber } from "ethers"
import { RawArgs, stark, uint256 } from "starknet"

import { sendMessage } from "../../shared/messages"

interface TransactionRequest {
  to: string
  method: string
  calldata: RawArgs
}

export const sendTransaction = (data: TransactionRequest) => {
  sendMessage({
    type: "EXECUTE_TRANSACTION",
    data: {
      transactions: {
        contractAddress: data.to,
        entrypoint: data.method,
        calldata: stark.compileCalldata(data.calldata || {}),
      },
    },
  })
}

export function getUint256CalldataFromBN(bn: BigNumber) {
  return {
    type: "struct" as const,
    ...uint256.bnToUint256(bn.toHexString()),
  }
}
