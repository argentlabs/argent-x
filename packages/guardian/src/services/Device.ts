import type { GenerateKeyPairResult } from "jose"

export interface Device {
  id?: number
  signingKey: GenerateKeyPairResult | string
  encryptionKey?: GenerateKeyPairResult

  /** presence of email indicates that the email has been verified by 2fa with backend */
  verifiedEmail?: string
  /** ISO date string of when the email was verified */
  verifiedAt?: string
}
