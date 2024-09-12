import { BaseWalletAccount, baseWalletAccountSchema } from "../wallet.model"
import { z } from "zod"
import {
  ApiMultisigOffchainSignatureStateSchema,
  multisigSignerSignaturesSchema,
  offchainSigMessageSchema,
} from "./multisig.model"
import { addressSchema, getAccountIdentifier } from "@argent/x-shared"
import { AllowArray, IRepository, SelectorFn } from "../storage/__new/interface"
import { ChromeRepository } from "../storage/__new/chrome"
import browser from "webextension-polyfill"
import { memoize } from "lodash-es"
import { accountsEqual } from "../utils/accountsEqual"

export const multisigPendingOffchainSignatureSchema = z.object({
  requestId: z.string(),
  account: baseWalletAccountSchema,
  message: offchainSigMessageSchema,
  signatures: multisigSignerSignaturesSchema,
  messageHash: z.string(),
  timestamp: z.number(),
  approvedSigners: z.array(z.string()),
  nonApprovedSigners: z.array(z.string()),
  creator: addressSchema,
  state: ApiMultisigOffchainSignatureStateSchema,
  notify: z.boolean(),
})

export type MultisigPendingOffchainSignature = z.infer<
  typeof multisigPendingOffchainSignatureSchema
>

export type IMultisigPendingOffchainSignaturesRepository =
  IRepository<MultisigPendingOffchainSignature>

export const multisigPendingOffchainSignaturesStore: IMultisigPendingOffchainSignaturesRepository =
  new ChromeRepository<MultisigPendingOffchainSignature>(browser, {
    areaName: "local",
    namespace: "core:multisig:pendingOffchainSignatures",
    compare: (a, b) => a.requestId === b.requestId,
  })

export const byAccountSelector = memoize(
  (account?: BaseWalletAccount) =>
    (transaction: MultisigPendingOffchainSignature) => {
      return accountsEqual(transaction.account, account)
    },
  (account) => (account ? getAccountIdentifier(account) : "unknown-account"),
)

export async function getMultisigPendingOffchainSignatures(
  selector: SelectorFn<MultisigPendingOffchainSignature> = () => true,
) {
  return multisigPendingOffchainSignaturesStore.get(selector)
}

export async function getMultisigPendingOffchainSignature(
  requestId: string,
): Promise<MultisigPendingOffchainSignature | undefined> {
  const pendingSignatures = await getMultisigPendingOffchainSignatures(
    (signature) => signature.requestId === requestId,
  )

  if (pendingSignatures.length === 0) {
    return undefined
  }

  return pendingSignatures[0]
}

export async function addMultisigPendingOffchainSignatures(
  signature: AllowArray<MultisigPendingOffchainSignature>,
) {
  return void multisigPendingOffchainSignaturesStore.upsert(signature)
}

export async function removeMultisigPendingOffchainSignature(
  signature: AllowArray<MultisigPendingOffchainSignature>,
) {
  return void multisigPendingOffchainSignaturesStore.remove(signature)
}

export async function setHasSeenOffchainSignatureNotification(
  id: string,
  hasSeen = true,
) {
  const signature = await getMultisigPendingOffchainSignature(id)

  if (!signature || signature.notify === hasSeen) {
    return
  }

  return addMultisigPendingOffchainSignatures({
    ...signature,
    notify: !hasSeen,
  })
}

export async function cancelPendingOffchainSignature(
  account: BaseWalletAccount,
) {
  const signature = await getMultisigPendingOffchainSignatures(
    byAccountSelector(account),
  )

  if (!signature) {
    return
  }

  for (const sig of signature) {
    await removeMultisigPendingOffchainSignature(sig)
  }
}
