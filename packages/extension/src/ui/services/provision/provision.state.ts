import { Status } from "../../../shared/provision/types"
import { KeyValueStorage } from "../../../shared/storage"
import { adaptKeyValue } from "../../../shared/storage/__new/keyvalue"
import { atomFromStore } from "../../views/implementation/atomFromStore"

export const provisionBannerKeyValueStore = new KeyValueStorage<{
  lastDismissedStatus: Status | null
}>(
  {
    lastDismissedStatus: null,
  },
  {
    namespace: "core:provisionBanner",
    areaName: "local",
  },
)

export const provisionBannerStore = adaptKeyValue(provisionBannerKeyValueStore)

export const provisionBannerAtom = atomFromStore(provisionBannerStore)

export const provisionAnnouncementShownKeyValueStore = new KeyValueStorage<{
  [accountAddress: string]: number
}>(
  {},
  {
    namespace: "core:provisionAnnouncementShown",
    areaName: "local",
  },
)

export const provisionAnnouncementStore = adaptKeyValue(
  provisionAnnouncementShownKeyValueStore,
)

export const provisionAnnouncementShownForAccountAtom = atomFromStore(
  provisionAnnouncementStore,
)
