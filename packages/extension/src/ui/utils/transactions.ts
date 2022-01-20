import { InvokeFunctionTransaction, compileCalldata, stark } from "starknet"

import { sendMessage } from "../../shared/messages"
import { TransactionRequest } from "../states/RouterMachine"

export const sendTransaction = (
  data: any /*TransactionRequest | InvokeFunctionTransaction*/,
) => {
  sendMessage({
    type: "ADD_TRANSACTION",
    data:
      "type" in data && data.type === "INVOKE_FUNCTION"
        ? data
        : {
            type: "INVOKE_FUNCTION",
            contract_address: (data as TransactionRequest).to,
            entry_point_selector: stark.getSelectorFromName(
              (data as TransactionRequest).method,
            ),
            calldata: compileCalldata(
              (data as TransactionRequest).calldata || {},
            ),
          },
  })
}
