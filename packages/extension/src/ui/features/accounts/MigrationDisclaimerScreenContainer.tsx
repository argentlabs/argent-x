// FIXME: remove when depricated accounts do not longer work
// TODO: this file also does not belong into onboarding feature
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { clientAccountService } from "../../services/account"
import { recover } from "../recovery/recovery.service"
import { MigrationDisclaimerScreen } from "./MigrationDisclaimerScreen"

// NOTE: this screen should not require fullscreen
export const MigrationDisclaimerScreenContainer: FC = () => {
  const navigate = useNavigate()
  // TODO: get rid of this global state after network views are implemented
  const { switcherNetworkId } = useAppState()

  const onCreate = useCallback(async () => {
    useAppState.setState({ isLoading: true })
    try {
      await clientAccountService.createAccount(switcherNetworkId)
      navigate(await recover())
    } catch (error: any) {
      useAppState.setState({ error: `${error}` })
      navigate(routes.error())
    } finally {
      useAppState.setState({ isLoading: false })
    }
  }, [navigate, switcherNetworkId])

  return <MigrationDisclaimerScreen onCreate={onCreate} />
}
