import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { provisionAnnouncementShownForAccountAtom } from "./provision.state"
import { recoveredAtAtom } from "../../features/recovery/recovery.state"

export const useProvisionAnnouncement = () => {
  const selectedAccount = useView(selectedAccountView)
  const recoveryView = useView(recoveredAtAtom)
  const provisionAnnouncementShownForAccountView = useView(
    provisionAnnouncementShownForAccountAtom,
  )
  if (!selectedAccount) {
    return
  }
  const hasRecoveredSinceProvision =
    recoveryView.lastRecoveredAt &&
    selectedAccount.provisionDate &&
    selectedAccount.provisionDate < recoveryView.lastRecoveredAt

  const hasSeenProvisionAnnouncementForAccount =
    Boolean(
      selectedAccount?.address in provisionAnnouncementShownForAccountView,
    ) || hasRecoveredSinceProvision
  if (
    selectedAccount?.provisionAmount &&
    !hasSeenProvisionAnnouncementForAccount
  ) {
    return {
      provisionedAccount: selectedAccount,
    }
  }
}
