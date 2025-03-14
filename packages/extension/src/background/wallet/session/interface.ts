export const Locked = Symbol("Locked")

export type Events = {
  [Locked]: boolean
}

export interface ISecureServiceSessionStore {
  exportedKey: string
  salt: string
  vault: string
}

export type SecretServiceEncryptedData = {
  password: string
  secret: string
}

export interface ISecretStorageService {
  encrypt(data: SecretServiceEncryptedData, password: string): Promise<void>
  decrypt(password?: string): Promise<SecretServiceEncryptedData | null>
  clear(): Promise<void>
}
