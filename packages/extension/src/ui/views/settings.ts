import { atom } from "jotai"

import { settingsStore } from "../../shared/settings/store"
import { atomFromKeyValueStore } from "./implementation/atomFromKeyValueStore"

export const hideTokensWithNoBalanceAtom = atomFromKeyValueStore(
  settingsStore,
  "hideTokensWithNoBalance",
)

export const hideTokensWithNoBalanceView = atom((get) =>
  get(hideTokensWithNoBalanceAtom),
)
