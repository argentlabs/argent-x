import type { FC } from "react"

import type { WalletAccount } from "../../../shared/wallet.model"
import { useAccountGuardianIsSelf } from "../smartAccount/useAccountGuardian"
import { usePendingChangeGuardian } from "../smartAccount/usePendingChangingGuardian"
import { EscapeBanner } from "./EscapeBanner"
import {
  useAccountHasPendingCancelEscape,
  useLiveAccountEscape,
} from "../smartAccount/escape/useAccountEscape"
import { accountHasEscape } from "../smartAccount/escape/accountHasEscape"

interface EscapeBannerContainerProps {
  account: WalletAccount
}

export const useShowEscapeBanner = (account: WalletAccount) => {
  const hasEscape = accountHasEscape(account)
  const accountGuardianIsSelf = useAccountGuardianIsSelf(account)
  return hasEscape || accountGuardianIsSelf
}

export const EscapeBannerContainer: FC<EscapeBannerContainerProps> = ({
  account,
}) => {
  const pending = useAccountHasPendingCancelEscape(account)
  const pendingChangeGuardian = usePendingChangeGuardian(account)
  const liveAccountEscape = useLiveAccountEscape(account)
  const accountGuardianIsSelf = useAccountGuardianIsSelf(account)
  return (
    <EscapeBanner
      account={account}
      pending={pending}
      pendingChangeGuardian={pendingChangeGuardian}
      liveAccountEscape={liveAccountEscape}
      accountGuardianIsSelf={accountGuardianIsSelf}
    />
  )
}
