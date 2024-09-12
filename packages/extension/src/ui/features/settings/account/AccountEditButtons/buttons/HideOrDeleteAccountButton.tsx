import { FC, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ButtonCell, iconsDeprecated } from "@argent/x-ui"

import { routes } from "../../../../../../shared/ui/routes"
import { isDeprecated } from "../../../../../../shared/wallet.service"
import { WalletAccount } from "../../../../../../shared/wallet.model"

const { HideIcon } = iconsDeprecated

export const HideOrDeleteAccountButtonContainer: FC<{
  account: WalletAccount
}> = ({ account }) => {
  const navigate = useNavigate()

  const type = useMemo(() => {
    const showDelete =
      isDeprecated(account) || account.networkId === "localhost"

    return showDelete ? "delete" : "hide"
  }, [account])

  const onHideOrDeleteAccount = (account: WalletAccount) => {
    if (type === "delete") {
      navigate(routes.accountDeleteConfirm(account.address))
    } else {
      navigate(routes.accountHideConfirm(account.address))
    }
  }

  return (
    <HideOrDeleteAccountButton
      account={account}
      type={type}
      onHideOrDeleteAccount={onHideOrDeleteAccount}
    />
  )
}

interface HideOrDeleteAccountButtonProps {
  account: WalletAccount
  type: "hide" | "delete"
  onHideOrDeleteAccount: (account: WalletAccount) => void
}

export const HideOrDeleteAccountButton: FC<HideOrDeleteAccountButtonProps> = ({
  account,
  type,
  onHideOrDeleteAccount,
}) => {
  return (
    <ButtonCell
      onClick={() => onHideOrDeleteAccount(account)}
      rightIcon={type === "hide" && <HideIcon />}
    >
      {type === "delete" ? "Delete account" : "Hide account"}
    </ButtonCell>
  )
}
