import {
  encryptWithDetail,
  decryptWithDetail,
  importKey,
  decryptWithKey,
} from "@metamask/browser-passworder"
import { isNil } from "lodash-es"
import type {
  ISecretStorageService,
  ISecureServiceSessionStore,
  SecretServiceEncryptedData,
} from "./interface"
import type { IKeyValueStorage } from "../../../shared/storage"

export default class SecretStorageService implements ISecretStorageService {
  constructor(
    private readonly sessionStore: IKeyValueStorage<ISecureServiceSessionStore>,
  ) {}

  async encrypt(data: SecretServiceEncryptedData, password: string) {
    const { vault, exportedKeyString } = await encryptWithDetail(password, data)
    const { salt } = JSON.parse(vault)

    await this.sessionStore.set("exportedKey", exportedKeyString)
    await this.sessionStore.set("salt", salt)
    await this.sessionStore.set("vault", vault)
  }

  async decrypt(password?: string) {
    const encryptedData = await this.sessionStore.get("vault")

    if (!encryptedData) {
      return null
    }

    // If password is provided, decrypt the data with the password
    if (!isNil(password)) {
      const { vault, exportedKeyString, salt } = await decryptWithDetail(
        password,
        encryptedData,
      )

      await this.sessionStore.set("exportedKey", exportedKeyString)
      await this.sessionStore.set("salt", salt)

      return vault as SecretServiceEncryptedData
    }

    // If password is not provided, decrypt the data with the stored key

    const exportedKey = await this.sessionStore.get("exportedKey")
    const salt = await this.sessionStore.get("salt")

    if (!exportedKey || !salt) {
      return null
    }

    const key = await importKey(exportedKey)
    const decryptedData = await decryptWithKey<SecretServiceEncryptedData>(
      key,
      JSON.parse(encryptedData),
    )

    return decryptedData
  }

  async clear() {
    await this.sessionStore.delete("exportedKey")
    await this.sessionStore.delete("salt")
  }
}
