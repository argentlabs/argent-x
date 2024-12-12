import type { FC } from "react"
import { settingsStore } from "../../../../../shared/settings"
import { useKeyValueStorage } from "../../../../hooks/useStorage"
import { ExperimentalSettingsScreen } from "./ExperimentalSettingsScreen"

export const ExperimentalSettingsScreenContainer: FC = () => {
  const experimentalAllowChooseAccount = useKeyValueStorage(
    settingsStore,
    "experimentalAllowChooseAccount",
  )

  const toggleExperimentalAllowChooseAccount = () => {
    void settingsStore.set(
      "experimentalAllowChooseAccount",
      !experimentalAllowChooseAccount,
    )
  }

  return (
    <ExperimentalSettingsScreen
      experimentalAllowChooseAccount={experimentalAllowChooseAccount}
      toggleExperimentalAllowChooseAccount={
        toggleExperimentalAllowChooseAccount
      }
    />
  )
}
