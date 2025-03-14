import { KeyValueStorage } from "../../../shared/storage"
import type { ISecureServiceSessionStore } from "./interface"
import SecretStorageService from "./secretStorageService"

export const secureStorageSessionStore =
  new KeyValueStorage<ISecureServiceSessionStore>(
    {
      exportedKey: "",
      salt: "",
      vault: "",
    },
    { namespace: "core:secureStorage", areaName: "session" },
  )

export const secretStorageService = new SecretStorageService(
  secureStorageSessionStore,
)
