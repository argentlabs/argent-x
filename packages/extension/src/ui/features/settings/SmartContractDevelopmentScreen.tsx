import {
  BarBackButton,
  CellStack,
  Empty,
  NavigationBar,
  icons,
} from "@argent/ui"
import { FC } from "react"

import { routes } from "../../routes"
import { useSelectedAccount } from "../accounts/accounts.state"
import { SettingsMenuItem } from "./SettingsMenuItem"

const { ArgentShieldIcon } = icons

const SmartContractDevelopmentScreen: FC = () => {
  const account = useSelectedAccount()
  const hasGuardian = Boolean(account?.guardian)
  return (
    <>
      <NavigationBar
        leftButton={<BarBackButton />}
        title={"Smart contract development"}
      />
      {hasGuardian ? (
        <Empty
          icon={<ArgentShieldIcon />}
          title={
            "You must remove Argent Shield from this account to access this feature"
          }
        />
      ) : (
        <CellStack>
          <SettingsMenuItem
            to={routes.settingsSmartContractDeclare()}
            title="Declare smart contract"
          />

          <SettingsMenuItem
            to={routes.settingsSmartContractDeploy()}
            title="Deploy smart contract"
          />
        </CellStack>
      )}
    </>
  )
}

export { SmartContractDevelopmentScreen }
