import { scryptAsync } from "@noble/hashes/scrypt"
import { xchacha20poly1305 } from "@noble/ciphers/chacha"
import type { EncryptedPKData, IPKStore } from "../types"
import type { IPKManager } from "./IPKManager"
import type { AccountId } from "../../wallet.model"
import {
  randomBytes,
  bytesToHex,
  utf8ToBytes,
  hexToBytes,
} from "@noble/hashes/utils"
import type { Hex } from "@argent/x-shared"
import { hexSchema } from "@argent/x-shared"
import type { IObjectStore } from "../../storage/__new/interface"
import { encode } from "starknet"

/**
 * PKManager is responsible for securely storing and retrieving encrypted private keys.
 * It uses the scrypt key derivation function and the XChaCha20-Poly1305 cipher for encryption and decryption.
 */
export class PKManager implements IPKManager {
  constructor(
    private readonly keystore: IObjectStore<IPKStore>,
    private SCRYPT_N: number,
  ) {}

  async storeEncryptedKey(
    pk: Hex,
    password: string,
    accountId: AccountId,
  ): Promise<void> {
    const encryptedData = await this.encryptKey(pk, password)
    const { keystore } = await this.keystore.get()
    await this.keystore.set({
      keystore: {
        ...keystore,
        [accountId]: encryptedData,
      },
    })
  }

  async retrieveDecryptedKey(
    password: string,
    accountId: AccountId,
  ): Promise<Hex> {
    const { keystore } = await this.keystore.get()
    if (!keystore[accountId]) {
      throw new Error("Key not found")
    }

    const decrypted = await this.decryptKey(keystore[accountId], password)
    return hexSchema.parse(bytesToHex(decrypted))
  }

  // Using XChaCha20-Poly1305 for encryption due to its extended nonce size (192 bits) which reduces the risk of nonce reuse,
  // and its performance benefits over AES-GCM for devices without hardware acceleration.
  async encryptKey(pk: Hex, password: string): Promise<EncryptedPKData> {
    const nonce = randomBytes(24)
    const salt = randomBytes(16)
    const key = await this.generateDerivedKey(password, salt)
    const cipher = xchacha20poly1305(key, nonce)
    const encrypted = cipher.encrypt(hexToBytes(encode.removeHexPrefix(pk)))
    return {
      nonce: bytesToHex(nonce),
      salt: bytesToHex(salt),
      encryptedKey: bytesToHex(encrypted),
    }
  }

  async decryptKey(
    data: EncryptedPKData,
    password: string,
  ): Promise<Uint8Array> {
    const salt = hexToBytes(data.salt)
    const key = await this.generateDerivedKey(password, salt)
    const nonce = hexToBytes(data.nonce)
    const cipher = xchacha20poly1305(key, nonce)
    return cipher.decrypt(hexToBytes(data.encryptedKey))
  }

  async removeKey(accountId: AccountId): Promise<void> {
    const { keystore } = await this.keystore.get()
    delete keystore[accountId]
    await this.keystore.set({ keystore })
  }

  private generateDerivedKey(
    password: string,
    salt: Uint8Array,
  ): Promise<Uint8Array> {
    return scryptAsync(utf8ToBytes(password), salt, {
      N: this.SCRYPT_N,
      r: 8,
      p: 1,
      dkLen: 32,
    })
  }
}
