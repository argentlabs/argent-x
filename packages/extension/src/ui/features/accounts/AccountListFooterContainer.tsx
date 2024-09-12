import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { iconsDeprecated } from "@argent/x-ui"
import { useReturnTo } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { AccountListFooter } from "./AccountListFooter"
import { useView } from "../../views/implementation/react"
import { selectedNetworkIdView } from "../../views/network"

const { AddIcon, HideIcon } = iconsDeprecated

interface AccountListFooterContainerProps {
  isHiddenAccounts: boolean
}

export const AccountListFooterContainer: FC<
  AccountListFooterContainerProps
> = ({ isHiddenAccounts }) => {
  const navigate = useNavigate()
  const selectedNetworkId = useView(selectedNetworkIdView)

  const returnTo = useReturnTo()

  const onClickHiddenAccounts = useCallback(() => {
    navigate(routes.accountsHidden(selectedNetworkId))
  }, [navigate, selectedNetworkId])

  const onClickAddAccount = useCallback(() => {
    navigate(routes.newAccount(returnTo))
  }, [navigate, returnTo])

  return (
    <AccountListFooter
      onClick={isHiddenAccounts ? onClickHiddenAccounts : onClickAddAccount}
      icon={isHiddenAccounts ? <HideIcon /> : <AddIcon />}
      text={isHiddenAccounts ? "Hidden accounts" : "Add account"}
    />
  )
}
