import { BigNumber } from "ethers"
import { useMemo } from "react"
import { stark } from "starknet"

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
              calldata: stark.compileCalldata({
                recipient,
                amount: getUint256CalldataFromBN(BigNumber.from(token.balance)),
              }),
            },
          ]
        : [],
    [token, recipient],
  )
  return maxAmountTransaction
}

export { useMaxAmountTransaction }
