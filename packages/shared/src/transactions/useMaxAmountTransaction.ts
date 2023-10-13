import { useMemo } from "react"
import { CallData } from "starknet"

import { TokenWithBalance } from "../tokens/token"
import { getUint256CalldataFromBN } from "../utils/parseAmount"

const useMaxAmountTransaction = (
  token: TokenWithBalance | undefined,
  recipient: string | undefined,
) => {
  const maxAmountTransaction = useMemo(
    () =>
      token && recipient
        ? [
            {
              contractAddress: token.address,
              entrypoint: "transfer",
              calldata: CallData.compile({
                recipient,
                amount: getUint256CalldataFromBN(token.balance),
              }),
            },
          ]
        : [],
    [token, recipient],
  )
  return maxAmountTransaction
}

export { useMaxAmountTransaction }
