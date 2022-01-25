import { BigNumber } from "ethers"
import { Args, compileCalldata, stark, uint256 } from "starknet"

import { sendMessage } from "../../shared/messages"

interface TransactionRequest {
  to: string
  method: string
  calldata: Args
}

export const sendTransaction = (data: TransactionRequest) => {
  sendMessage({
    type: "ADD_TRANSACTION",
    data: {
      type: "INVOKE_FUNCTION",
      contract_address: data.to,
      entry_point_selector: stark.getSelectorFromName(data.method),
      calldata: compileCalldata(data.calldata || {}),
    },
  })
}

export function getUint256CalldataFromBN(bn: BigNumber) {
  return {
    type: "struct" as const,
    ...uint256.bnToUint256(bn.toHexString()),
  }
}
