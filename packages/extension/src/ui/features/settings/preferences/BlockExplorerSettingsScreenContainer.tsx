import type { FC } from "react"

import { settingsStore } from "../../../../shared/settings"
import type { BlockExplorerKey } from "../../../../shared/settings/defaultBlockExplorers"
import { useKeyValueStorage } from "../../../hooks/useStorage"
import { BlockExplorerSettingsScreen } from "./BlockExplorerSettingsScreen"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { ampli } from "../../../../shared/analytics"

export const BlockExplorerSettingsScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const blockExplorerKey = useKeyValueStorage(settingsStore, "blockExplorerKey")
  const onChange = (key: BlockExplorerKey) => {
    void ampli.blockerExplorerChanged({
      provider: key,
      "wallet platform": "browser extension",
    })
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
