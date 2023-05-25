import { AllowArray } from "starknet"

import { getNetwork } from "../../network"
import { SelectorFn } from "../../storage/types"
import {
  BaseMultisigWalletAccount,
  MultisigWalletAccount,
} from "../../wallet.model"
import { pendingMultisigEqual, pendingMultisigStore } from "./../store"
import { BasePendingMultisig, PendingMultisig } from "../types"
import { addMultisigAccounts } from "./baseMultisig"
import {
  getPendingMultisigSelector,
  withoutHiddenPendingMultisig,
} from "./selectors"

export async function getAllPendingMultisigs(
  selector: SelectorFn<PendingMultisig> = withoutHiddenPendingMultisig,
): Promise<PendingMultisig[]> {
  return pendingMultisigStore.get(selector)
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
    networkId: pendingMultisig.networkId,
    signer: pendingMultisig.signer,
    signers: multisigData.signers,
    publicKey: pendingMultisig.publicKey,
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

export async function updatePendingMultisigName(
  base: BasePendingMultisig,
  name: string,
) {
  const [hit] = await getAllPendingMultisigs(getPendingMultisigSelector(base))
  if (!hit) {
    return
  }
  await pendingMultisigStore.push({
    ...hit,
    name,
  })
}

export async function hidePendingMultisig(base: BasePendingMultisig) {
  const [hit] = await getAllPendingMultisigs(getPendingMultisigSelector(base))
  if (!hit) {
    return
  }
  await pendingMultisigStore.push({
    ...hit,
    hidden: true,
  })
}

export async function unhidePendingMultisig(base: BasePendingMultisig) {
  const [hit] = await getAllPendingMultisigs(getPendingMultisigSelector(base))
  if (!hit) {
    return
  }
  await pendingMultisigStore.push({
    ...hit,
    hidden: false,
  })
}
