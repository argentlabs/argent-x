import useSwr from "swr"

import { getFeeToken, getTokens } from "../services/tokens/balances"

export const useTokens = () => {
  const { data: tokens } = useSwr("services/tokens/balances/getTokens", () =>
    getTokens(),
  )

  return tokens
}

export const useFeeToken = () => {
  const { data: feeToken } = useSwr(
    "services/tokens/balances/getFeeToken",
    () => getFeeToken(),
  )

  return feeToken
}
