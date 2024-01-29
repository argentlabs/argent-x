import { FC } from "react"

import { settingsStore } from "../../../../shared/settings"
import { BlockExplorerKey } from "../../../../shared/settings/defaultBlockExplorers"
import { useKeyValueStorage } from "../../../hooks/useStorage"
import { BlockExplorerSettingsScreen } from "./BlockExplorerSettingsScreen"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"

export const BlockExplorerSettingsScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const blockExplorerKey = useKeyValueStorage(settingsStore, "blockExplorerKey")
  const onChange = (key: BlockExplorerKey) => {
    void settingsStore.set("blockExplorerKey", key)
  }
  return (
    <BlockExplorerSettingsScreen
      onBack={onBack}
      blockExplorerKey={blockExplorerKey}
      onChange={onChange}
    />
  )
}
