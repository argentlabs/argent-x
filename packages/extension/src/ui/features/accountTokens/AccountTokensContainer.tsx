import { FC } from "react"

import { AccountTokens } from "./AccountTokens"
import { WalletAccount } from "../../../shared/wallet.model"
import { usePromptUserReview } from "./usePromptUserReview"

interface AccountTokensContainerProps {
  account: WalletAccount
}

export const AccountTokensContainer: FC<AccountTokensContainerProps> = ({
  account,
}) => {
  usePromptUserReview()
  return <AccountTokens account={account} />
}
