import type { FC } from "react"
import { Suspense } from "react"

import { AccountTokens, AccountTokensSkeleton } from "./AccountTokens"
import type { WalletAccount } from "../../../shared/wallet.model"

interface AccountTokensContainerProps {
  account: WalletAccount
}

export const AccountTokensContainer: FC<AccountTokensContainerProps> = ({
  account,
}) => {
  return (
    <Suspense fallback={<AccountTokensSkeleton />}>
      <AccountTokens account={account} />
    </Suspense>
  )
}
