import { FC } from "react"
import { WalletAccount } from "../../../shared/wallet.model"
import { usePrettyAccountBalance } from "./usePrettyAccountBalance"

interface PrettyAccountBalanceProps {
  account: WalletAccount
}

export const PrettyAccountBalanceOrName: FC<PrettyAccountBalanceProps> = ({
  account,
}) => {
  const prettyAccountBalance = usePrettyAccountBalance(account)
  return <>{prettyAccountBalance || account.name}</>
}

/**
 * FIXME: usePrettyAccountBalance hook is heavy and slow
 * As a workaround, this component can be wrapped in Suspense for more performant UI
 */
export const PrettyAccountBalance: FC<PrettyAccountBalanceProps> = ({
  account,
}) => {
  const prettyAccountBalance = usePrettyAccountBalance(account)
  return <>{prettyAccountBalance}</>
}
