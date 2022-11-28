import { getFeeToken } from "../../../../../shared/token/utils"
import { useAccount } from "../../../accounts/accounts.state"
import { useFeeTokenBalance } from "../../../accountTokens/tokens.service"

export const useEstimationAccountFees = (
  address: string,
  networkId: string,
) => {
  const account = useAccount({ address, networkId })
  if (!account) {
    throw new Error("Account not found")
  }
  const { feeTokenBalance } = useFeeTokenBalance(account)
  const feeToken = getFeeToken(networkId)

  return {
    account,
    feeTokenBalance,
    feeToken,
  }
}
