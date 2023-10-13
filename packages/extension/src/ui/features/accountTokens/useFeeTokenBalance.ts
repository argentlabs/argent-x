import { feeTokenBalanceView } from "./../../views/tokenBalances"
import { Account } from "../accounts/Account"
import { useView } from "../../views/implementation/react"

export const useFeeTokenBalance = (
  account?: Pick<Account, "address" | "networkId">,
) => {
  const feeTokenBalance = useView(feeTokenBalanceView(account))
  return {
    feeTokenBalance: feeTokenBalance?.balance
      ? BigInt(feeTokenBalance.balance)
      : undefined,
    feeTokenBalanceError: undefined,
    feeTokenBalanceValidating: false,
  }
}
