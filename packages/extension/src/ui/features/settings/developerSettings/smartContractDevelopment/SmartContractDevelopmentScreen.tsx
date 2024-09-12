import {
  BarBackButton,
  CellStack,
  Empty,
  NavigationBar,
  iconsDeprecated,
} from "@argent/x-ui"
import { FC } from "react"

import { routes } from "../../../../../shared/ui/routes"
import { selectedAccountView } from "../../../../views/account"
import { useView } from "../../../../views/implementation/react"
import { SettingsMenuItemLink } from "../../ui/SettingsMenuItem"

const { SmartAccountIcon } = iconsDeprecated

const SmartContractDevelopmentScreen: FC = () => {
  const account = useView(selectedAccountView)
  const hasGuardian = Boolean(account?.guardian)
  return (
    <>
      <NavigationBar
        leftButton={<BarBackButton />}
        title={"Smart contract development"}
      />
      {hasGuardian ? (
        <Empty
          icon={<SmartAccountIcon />}
          title={"You must change to Standard Account to access this feature"}
        />
      ) : (
        <CellStack>
          <SettingsMenuItemLink
            to={routes.settingsSmartContractDeclare()}
            title="Declare smart contract"
          />

          <SettingsMenuItemLink
            to={routes.settingsSmartContractDeploy()}
            title="Deploy smart contract"
          />
        </CellStack>
      )}
    </>
  )
}

export { SmartContractDevelopmentScreen }
