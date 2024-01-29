import {
  BarBackButton,
  CellStack,
  Empty,
  NavigationBar,
  icons,
} from "@argent/ui"
import { FC } from "react"

import { routes } from "../../../../routes"
import { selectedAccountView } from "../../../../views/account"
import { useView } from "../../../../views/implementation/react"
import { SettingsMenuItemLink } from "../../ui/SettingsMenuItem"

const { ShieldIcon } = icons

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
          icon={<ShieldIcon />}
          title={
            "You must remove Argent Shield from this account to access this feature"
          }
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
