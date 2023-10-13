import {
  AlertDialog,
  BarBackButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
  Switch,
} from "@argent/ui"
import { FC, useCallback, useState } from "react"

import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { WalletAccount } from "../../../shared/wallet.model"
import { useAccountsWithGuardian } from "../shield/useAccountGuardian"
import { SettingsScreenWrapper } from "./SettingsScreen"

const formatAccountNames = (accounts: WalletAccount[]) => {
  const elements = accounts.map((account) => {
    const accountName = account ? account.name : "Unknown"
    return accountName
  })
  const formatter = new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  })
  return formatter.format(elements)
}

export const PrivacyExperimentalSettings: FC = () => {
  const [alertDialogIsOpen, setAlertDialogIsOpen] = useState(false)

  const accountsWithGuardian = useAccountsWithGuardian()
  const accountGuardianNames = formatAccountNames(accountsWithGuardian)

  const experimentalAllowChooseAccount = useKeyValueStorage(
    settingsStore,
    "experimentalAllowChooseAccount",
  )

  const onCancel = useCallback(() => {
    setAlertDialogIsOpen(false)
  }, [])

  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Experimental"}>
      <AlertDialog
        isOpen={alertDialogIsOpen}
        title={"Argent Shield in use"}
        message={`To turn off this feature you need to first remove Argent Shield from ${accountGuardianNames}`}
        cancelTitle={"Got it"}
        onCancel={onCancel}
      />
      <SettingsScreenWrapper>
        <CellStack>
          <ButtonCell
            onClick={() =>
              settingsStore.set(
                "experimentalAllowChooseAccount",
                !experimentalAllowChooseAccount,
              )
            }
            rightIcon={<Switch isChecked={experimentalAllowChooseAccount} />}
            extendedDescription={
              "Shows a new menu item in the account settings, which allows a user to switch account implementation for an account."
            }
          >
            Change account implementation
          </ButtonCell>
        </CellStack>
      </SettingsScreenWrapper>
    </NavigationContainer>
  )
}
