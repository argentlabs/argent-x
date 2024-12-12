import type { Hex } from "@argent/x-shared"
import { KeyValueStorage } from "../../shared/storage"
import { adaptKeyValue } from "../../shared/storage/__new/keyvalue"
import type { AccountId } from "../../shared/wallet.model"

export type NonceMap = {
  local: Record<AccountId, Hex>
}

/** For future implementation with parallel nonce channels
 *  
type NonceChannel = number

type NonceWithChannelsMap = {
  [key: AccountId]: {
    [key: NonceChannel]: Hex
  }
}
*/

const nonceKeyValue = new KeyValueStorage<NonceMap>(
  {
    local: {},
  },
  {
    namespace: "core:nonceManagerV2",
    areaName: "session",
  },
)

export const nonceStore = adaptKeyValue(nonceKeyValue)
