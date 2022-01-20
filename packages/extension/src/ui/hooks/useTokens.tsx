import useSWR from "swr"

import { useGlobalState } from "../states/global"
import { fetchTokenDetails, getTokens, tokensMitt } from "../utils/tokens"
import { useMitt } from "./useMitt"

export const useTokens = () => {
  const { networkId, selectedWallet } = useGlobalState()

  if (!selectedWallet) {
    return { tokenDetails: [], isValidating: false, hasBalance: false }
  }

  const tokens = useMitt(
    tokensMitt,
    "UPDATE",
    () => getTokens(selectedWallet, networkId),
    true,
  )

  const { data: tokenDetails = [], isValidating } = useSWR(
    [tokens, selectedWallet],
    async (tokens, walletAddress) =>
      Promise.all(
        tokens.map((address) =>
          fetchTokenDetails(address, walletAddress, networkId),
        ),
      ),

    { suspense: true, refreshInterval: 30000 },
  )

  const hasBalance = tokenDetails.some(
    ({ balance }) => balance && !balance.isZero(),
  )

  return { tokenDetails, isValidating, hasBalance }
}
