import { STRK_TOKEN_ADDRESS } from "../../network/constants"
import { KeyValueStorage } from "../../storage"
import { adaptKeyValue } from "../../storage/__new/keyvalue"
import type { FeeTokenPreference } from "../types/preference.model"

export const feeTokenPreferenceKeyValueStore =
  new KeyValueStorage<FeeTokenPreference>(
    {
      prefer: STRK_TOKEN_ADDRESS,
    },
    {
      namespace: "core:feeTokensPreference",
      areaName: "local",
    },
  )

export const feeTokenPreferenceStore = adaptKeyValue(
  feeTokenPreferenceKeyValueStore,
)
