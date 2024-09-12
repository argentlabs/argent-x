import { z } from "zod"
import { addressSchema } from "@argent/x-shared"

import { escapeSchema } from "./account/details/escape.model"
import { defaultNetwork, networkSchema } from "./network"

export const argentAccountTypeSchema = z.enum([
  "standard",
  "plugin",
  "multisig",
  "betterMulticall",
  "argent5MinuteEscapeTestingAccount",
  "standardCairo0",
  "smart",
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

export const networkOnlyPlaceholderAccountSchema = z.object({
  address: z.null(),
  networkId: z.string(),
})

export enum SignerType {
  LOCAL_SECRET = "local_secret",
  LEDGER = "ledger",
}

export const signerTypeSchema = z.nativeEnum(SignerType)

export const walletAccountSignerSchema = z.object({
  type: signerTypeSchema,
  derivationPath: z.string(),
})

export const withSignerSchema = z.object({
  signer: walletAccountSignerSchema,
})

export const withLedgerSignerSchema = z.object({
  signer: z.object({
    type: z.literal(SignerType.LEDGER),
    derivationPath: z.string(),
  }),
})

export const cairoVersionSchema = z.union([z.literal("0"), z.literal("1")])
export const walletAccountSchema = z
  .object({
    name: z.string(),
    network: networkSchema,
    type: argentAccountTypeSchema,
    classHash: addressSchema.optional(),
    cairoVersion: cairoVersionSchema.optional(),
    hidden: z.boolean().optional(),
    needsDeploy: z.boolean().optional(),
    showBlockingDeprecated: z.boolean().optional(),
    guardian: z.string().optional(),
    escape: escapeSchema.optional(),
    owner: z.string().optional(),
    index: z.number().optional(),
    salt: addressSchema.optional(),
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
  index: z.number().optional(),
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

export const recoveredLedgerMultisigSchema = z.object({
  pubKey: z.string(),
  account: walletAccountSchema,
})

export const importedLedgerAccountSchema = baseWalletAccountSchema.merge(
  withLedgerSignerSchema,
)

export type StoredWalletAccount = z.infer<typeof storedWalletAccountSchema>
export type MultisigData = z.infer<typeof multisigDataSchema>
export type MultisigWalletAccount = z.infer<typeof multisigWalletAccountSchema>
export type BaseMultisigWalletAccount = z.infer<
  typeof baseMultisigWalletAccountSchema
>
export type WithSigner = z.infer<typeof withSignerSchema>
export type BaseWalletAccount = z.infer<typeof baseWalletAccountSchema>
export type NetworkOnlyPlaceholderAccount = z.infer<
  typeof networkOnlyPlaceholderAccountSchema
>
export type WalletAccountSigner = z.infer<typeof walletAccountSignerSchema>
export type ArgentAccountType = z.infer<typeof argentAccountTypeSchema>
export type CreateAccountType = z.infer<typeof createAccountTypeSchema>
export type WalletAccount = z.infer<typeof walletAccountSchema>
export type CreateWalletAccount = z.infer<typeof createWalletAccountSchema>
export type RecoveredLedgerMultisig = z.infer<
  typeof recoveredLedgerMultisigSchema
>
export type ImportedLedgerAccount = z.infer<typeof importedLedgerAccountSchema>

export function isNetworkOnlyPlaceholderAccount(
  walletAccount: unknown,
): walletAccount is NetworkOnlyPlaceholderAccount {
  return networkOnlyPlaceholderAccountSchema.safeParse(walletAccount).success
}

export const defaultNetworkOnlyPlaceholderAccount: NetworkOnlyPlaceholderAccount =
  {
    address: null,
    networkId: defaultNetwork.id,
  }
