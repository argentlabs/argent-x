import { AllowArray } from "starknet"

import { getNetwork } from "../../network"
import {
  BaseMultisigWalletAccount,
  MultisigWalletAccount,
} from "../../wallet.model"
import { pendingMultisigEqual, pendingMultisigStore } from "./../store"
import { BasePendingMultisig, PendingMultisig } from "../types"
import { addMultisigAccounts } from "./baseMultisig"

export async function getAllPendingMultisigs(): Promise<PendingMultisig[]> {
  return pendingMultisigStore.get()
}

export async function getPendingMultisig(
  basePendingMultisig: BasePendingMultisig,
) {
  const pendingMultisigs = await getAllPendingMultisigs()
  return pendingMultisigs.find((pendingMultisig) =>
    pendingMultisigEqual(pendingMultisig, basePendingMultisig),
  )
}

export async function addPendingMultisig(
  pendingMultisig: AllowArray<PendingMultisig>,
): Promise<void> {
  return pendingMultisigStore.push(pendingMultisig)
}

export async function removePendingMultisig(
  basePendingMultisig: BasePendingMultisig,
): Promise<PendingMultisig[]> {
  const pendingMultisig = await getPendingMultisig(basePendingMultisig)

  if (!pendingMultisig) {
    throw new Error("Pending multisig to remove not found")
  }

  return pendingMultisigStore.remove(pendingMultisig)
}

export async function pendingMultisigToMultisig(
  basePendingMultisig: BasePendingMultisig,
  multisigData: BaseMultisigWalletAccount,
) {
  const network = await getNetwork(multisigData.networkId)

  const pendingMultisig = await getPendingMultisig(basePendingMultisig)

  if (!pendingMultisig) {
    throw new Error("Pending multisig to convert to Multisig not found")
  }

  const fullMultisig: MultisigWalletAccount = {
    address: multisigData.address,
    name: pendingMultisig.name,
    type: "multisig",
    networkId: multisigData.networkId,
    signer: pendingMultisig.signer,
    signers: multisigData.signers,
    threshold: multisigData.threshold,
    creator: multisigData.creator,
    network,
    needsDeploy: false,
    hidden: false,
  }

  await removePendingMultisig(pendingMultisig)
  await addMultisigAccounts(fullMultisig)
  return fullMultisig
}
