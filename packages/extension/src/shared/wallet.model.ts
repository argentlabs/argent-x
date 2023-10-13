import { z } from "zod"

import { escapeSchema } from "./account/details/escape.model"
import { networkSchema } from "./network"
import { addressSchema } from "@argent/shared"

export const argentAccountTypeSchema = z.enum([
  "standard",
  "plugin",
  "multisig",
  "betterMulticall",
  "argent5MinuteEscapeTestingAccount",
  "standardCairo0",
])
export const createAccountTypeSchema = argentAccountTypeSchema.exclude([
  "plugin",
  "betterMulticall",
  "argent5MinuteEscapeTestingAccount",
])
export const baseWalletAccountSchema = z.object({
  address: z.string(),
  networkId: z.string(),
})
export const walletAccountSignerSchema = z.object({
  type: z.literal("local_secret"),
  derivationPath: z.string(),
})
export const withSignerSchema = z.object({
  signer: walletAccountSignerSchema,
})

export const walletAccountSchema = z
  .object({
    name: z.string(),
    network: networkSchema,
    type: argentAccountTypeSchema,
    classHash: addressSchema.optional(),
    cairoVersion: z.union([z.literal("0"), z.literal("1")]).optional(),
    hidden: z.boolean().optional(),
    needsDeploy: z.boolean().optional(),
    showBlockingDeprecated: z.boolean().optional(),
    guardian: z.string().optional(),
    escape: escapeSchema.optional(),
  })
  .merge(withSignerSchema)
  .merge(baseWalletAccountSchema)

export const storedWalletAccountSchema = walletAccountSchema.omit({
  network: true,
})

export const multisigDataSchema = z.object({
  publicKey: z.string(),
  signers: z.array(z.string()),
  threshold: z.number(),
  creator: z.string().optional(), // Creator is the public key of the account that created the multisig account
  updatedAt: z.number(),
})

export const baseMultisigWalletAccountSchema =
  baseWalletAccountSchema.merge(multisigDataSchema)
export const multisigWalletAccountSchema = z
  .object({
    type: z.literal("multisig"),
  })
  .merge(walletAccountSchema)
  .merge(multisigDataSchema)

export const createWalletAccountSchema = z
  .object({
    type: createAccountTypeSchema,
  })
  .merge(walletAccountSchema)

export type StoredWalletAccount = z.infer<typeof storedWalletAccountSchema>
export type MultisigData = z.infer<typeof multisigDataSchema>
export type MultisigWalletAccount = z.infer<typeof multisigWalletAccountSchema>
export type BaseMultisigWalletAccount = z.infer<
  typeof baseMultisigWalletAccountSchema
>
export type WithSigner = z.infer<typeof withSignerSchema>
export type BaseWalletAccount = z.infer<typeof baseWalletAccountSchema>
export type WalletAccountSigner = z.infer<typeof walletAccountSignerSchema>
export type ArgentAccountType = z.infer<typeof argentAccountTypeSchema>
export type CreateAccountType = z.infer<typeof createAccountTypeSchema>
export type WalletAccount = z.infer<typeof walletAccountSchema>
export type CreateWalletAccount = z.infer<typeof createWalletAccountSchema>
