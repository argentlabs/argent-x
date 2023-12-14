import { KeyValueStorage } from "../storage"
import { IActivityStorage } from "./types"

export const activityStore = new KeyValueStorage<IActivityStorage>(
  {
    latestBalanceChangingActivity: null,
  },
  {
    namespace: "service:activity",
  },
)
