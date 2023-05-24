import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes, useReturnTo } from "../../../routes"
import { useNeedsToShowNetworkStatusWarning } from "../hooks/useNeedsToShowNetworkStatusWarning"
import { NetworkWarningScreen } from "./NetworkWarningScreen"

export const NetworkWarningScreenContainer: FC = () => {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const [, updateNeedsToShowNetworkStatusWarning] =
    useNeedsToShowNetworkStatusWarning()
  const onClick = () => {
    updateNeedsToShowNetworkStatusWarning()
    navigate(returnTo ? returnTo : routes.accounts())
  }
  return <NetworkWarningScreen onClick={onClick} />
}
