import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { HiddenAccountsBar } from "./HiddenAccountsBarContainer"

export const HiddenAccountsBarContainer: FC = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const onClick = useCallback(() => {
    navigate(routes.accountsHidden(switcherNetworkId))
  }, [navigate, switcherNetworkId])
  return <HiddenAccountsBar onClick={onClick} />
}
