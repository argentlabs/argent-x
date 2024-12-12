import { z } from "zod"
import type { AccountId } from "../wallet.model"
import { addressSchema, hexSchema } from "@argent/x-shared"

export enum AccountImportError {
  ACCOUNT_NOT_FOUND = "The account was not found",
  INVALID_PK = "The private key is invalid",
  HAS_GUARDIAN = "This account has a guardian signer",
  IS_MULTISIG = "The account is a multisig account",
}

export const importErrorTypeSchema = z.nativeEnum(AccountImportError)

export const validatedImportSchema = z.object({
  classHash: addressSchema,
  address: addressSchema,
  pk: hexSchema,
  networkId: z.string(),
})

export type ValidatedImport = z.infer<typeof validatedImportSchema>

export const importValidationResult = z.union([
  z.object({
    success: z.literal(true),
    result: validatedImportSchema,
  }),
  z.object({
    success: z.literal(false),
    errorType: importErrorTypeSchema,
  }),
])

export type ImportValidationResult = z.infer<typeof importValidationResult>

export const encryptedPKDataSchema = z.object({
  encryptedKey: z.string(),
  nonce: z.string(),
  salt: z.string(),
})

export type EncryptedPKData = z.infer<typeof encryptedPKDataSchema>

export interface IPKStore {
  keystore: Record<AccountId, EncryptedPKData>
}
