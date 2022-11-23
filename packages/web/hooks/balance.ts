import useSwr from "swr"

import { getTokenBalance } from "../services/tokens/balances"
import { useAccount } from "./account"
import { useFeeToken } from "./token"

export const useTokenBalance = (tokenAddress: string | undefined) => {
  const { account } = useAccount()
  const { data: tokenBalance } = useSwr(
    account?.address && tokenAddress
      ? [
          "services/tokens/balances/getTokenBalance",
          tokenAddress,
          account.address,
        ]
      : undefined,
    () => getTokenBalance(tokenAddress!, account!.address),
  )

  return tokenBalance
}

export const useFeeTokenBalance = () => {
  const feeToken = useFeeToken()
  return useTokenBalance(feeToken?.address)
}
