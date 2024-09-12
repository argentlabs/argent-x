import { ObjectStorage } from "../../storage"
import { adaptObjectStorage } from "../../storage/__new/object"
import { WalletSession } from "../service/accountSharedService/WalletAccountSharedService"

/**
 * @deprecated use `sessionRepo` instead
 */
export const sessionStore = new ObjectStorage<WalletSession | null>(null, {
  namespace: "core:wallet:session",
  areaName: "session",
})

export const sessionRepo = adaptObjectStorage(sessionStore)
