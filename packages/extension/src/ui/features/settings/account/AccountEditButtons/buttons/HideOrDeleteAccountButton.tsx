import type { FC } from "react"
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { HideSecondaryIcon, BinSecondaryIcon } from "@argent/x-ui/icons"
import { ButtonCell } from "@argent/x-ui"

import { routes } from "../../../../../../shared/ui/routes"
import { isDeprecated } from "../../../../../../shared/wallet.service"
import type { WalletAccount } from "../../../../../../shared/wallet.model"
import { upperFirst } from "lodash-es"

export const HideOrDeleteAccountButtonContainer: FC<{
  account: WalletAccount
  type?: "hide" | "delete" | "remove"
}> = ({ account, type }) => {
  const navigate = useNavigate()

  const action = useMemo(() => {
    if (type) {
      return type
    }

    const showDelete =
      isDeprecated(account) || account.networkId === "localhost"

    return showDelete ? "delete" : "hide"
  }, [account, type])

  const icon = useMemo(() => {
    switch (action) {
      case "hide":
        return <HideSecondaryIcon />
      case "remove":
        return <BinSecondaryIcon color="accent-red" />
      default:
        return null
    }
  }, [action])

  const onHideOrDeleteAccount = (account: WalletAccount) => {
    return navigate(routes.accountHideOrDeleteConfirm(account.id, action))
  }

  return (
    <HideOrDeleteAccountButton
      account={account}
      icon={icon}
      action={action}
      onHideOrDeleteAccount={onHideOrDeleteAccount}
    />
  )
}

interface HideOrDeleteAccountButtonProps {
  account: WalletAccount
  action: "hide" | "delete" | "remove"
  icon: React.ReactNode
  onHideOrDeleteAccount: (account: WalletAccount) => void
}

export const HideOrDeleteAccountButton: FC<HideOrDeleteAccountButtonProps> = ({
  account,
  action,
  icon,
  onHideOrDeleteAccount,
}) => {
  return (
    <ButtonCell
      colorScheme={action === "remove" ? "neutrals-danger" : "default"}
      onClick={() => onHideOrDeleteAccount(account)}
      rightIcon={icon}
    >
      {upperFirst(action)} account
    </ButtonCell>
  )
}
