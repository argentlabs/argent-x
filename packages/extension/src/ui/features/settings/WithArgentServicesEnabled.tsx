import { BarCloseButton, Empty, NavigationContainer, icons } from "@argent/ui"
import { FC, PropsWithChildren } from "react"
import { useNavigate } from "react-router-dom"

import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { routes } from "../../routes"

const { SettingsIcon } = icons

/**
 * Wraps any screen which may need to use Argent Services, and shows a message to the user if they are disabled
 */

export const WithArgentServicesEnabled: FC<PropsWithChildren> = ({
  children,
}) => {
  const navigate = useNavigate()
  const privacyUseArgentServices = useKeyValueStorage(
    settingsStore,
    "privacyUseArgentServices",
  )
  if (privacyUseArgentServices) {
    return <>{children}</>
  }
  return (
    <NavigationContainer
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
      title={"Argent Services Required"}
    >
      <Empty
        icon={<SettingsIcon />}
        title={`You need to enable Argent Services in Privacy Settings to use this feature`}
      />
    </NavigationContainer>
  )
}
