import { AllowArray } from "starknet"

import { PendingMultisig, pendingMultisigStore } from "./../store"

export async function getAllPendingMultisigs(): Promise<PendingMultisig[]> {
  return pendingMultisigStore.get()
}

export async function addPendingMultisig(
  pendingMultisig: AllowArray<PendingMultisig>,
): Promise<void> {
  return pendingMultisigStore.push(pendingMultisig)
}

export async function removePendingMultisig(
  pendingMultisig: PendingMultisig,
): Promise<PendingMultisig[]> {
  return pendingMultisigStore.remove(pendingMultisig)
}
