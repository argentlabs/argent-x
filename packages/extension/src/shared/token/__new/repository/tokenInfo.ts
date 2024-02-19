import { KeyValueStorage } from "../../../storage"
import { adaptKeyValue } from "../../../storage/__new/keyvalue"
import { TokenInfoByNetwork } from "../types/tokenInfo.model"

const keyValueStorage = new KeyValueStorage<TokenInfoByNetwork>(
  {},
  {
    namespace: "core:tokenInfo",
  },
)

export const tokenInfoStore = adaptKeyValue(keyValueStorage)
