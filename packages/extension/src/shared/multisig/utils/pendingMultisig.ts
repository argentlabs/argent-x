import type { AllowArray } from "starknet"

import { networkService } from "../../network/service"
import type { SelectorFn } from "../../storage/types"
import type {
  BaseMultisigWalletAccount,
  MultisigWalletAccount,
} from "../../wallet.model"
import { pendingMultisigRepo } from "../repository"
import type { BasePendingMultisig, PendingMultisig } from "../types"
import { addMultisigAccount } from "./baseMultisig"
import {
  getPendingMultisigSelector,
  pendingMultisigEqual,
  withoutHiddenPendingMultisig,
} from "./selectors"
import { getAccountIdentifier } from "../../utils/accountIdentifier"
import { getAccountClassHashFromChain } from "../../account/details"
import { accountsEqual } from "../../utils/accountsEqual"
import { getAccountMeta } from "../../accountNameGenerator"

export async function getAllPendingMultisigs(
  selector: SelectorFn<PendingMultisig> = withoutHiddenPendingMultisig,
): Promise<PendingMultisig[]> {
  return pendingMultisigRepo.get(selector)
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
  await pendingMultisigRepo.upsert(pendingMultisig)
}

export async function removePendingMultisig(
  basePendingMultisig: BasePendingMultisig,
): Promise<PendingMultisig[]> {
  const pendingMultisig = await getPendingMultisig(basePendingMultisig)

  if (!pendingMultisig) {
    throw new Error("Pending multisig to remove not found")
  }

  return pendingMultisigRepo.remove((multisig) =>
    pendingMultisigEqual(multisig, basePendingMultisig),
  )
}

export async function pendingMultisigToMultisig(
  basePendingMultisig: BasePendingMultisig,
  multisigData: BaseMultisigWalletAccount,
) {
  const network = await networkService.getById(multisigData.networkId)

  const pendingMultisig = await getPendingMultisig(basePendingMultisig)

  if (!pendingMultisig) {
    throw new Error("Pending multisig to convert to Multisig not found")
  }

  const id = getAccountIdentifier(
    multisigData.address,
    multisigData.networkId,
    pendingMultisig.signer,
  )

  const { name } = getAccountMeta(id, "multisig")

  const fullMultisig: MultisigWalletAccount = {
    id,
    address: multisigData.address,
    name,
    type: "multisig",
    networkId: pendingMultisig.networkId,
    signer: pendingMultisig.signer,
    signers: multisigData.signers,
    publicKey: pendingMultisig.publicKey,
    threshold: multisigData.threshold,
    creator: multisigData.creator,
    updatedAt: multisigData.updatedAt,
    network,
    needsDeploy: false,
    hidden: false,
  }

  const accountsWithClassHash = await getAccountClassHashFromChain([
    fullMultisig,
  ])
  const classHash = accountsWithClassHash.find((ac) =>
    accountsEqual(ac, fullMultisig),
  )?.classHash

  fullMultisig.classHash = classHash

  await removePendingMultisig(pendingMultisig)
  await addMultisigAccount(fullMultisig)
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
  await pendingMultisigRepo.upsert({
    ...hit,
    name,
  })
}

export async function hidePendingMultisig(base: BasePendingMultisig) {
  const [hit] = await getAllPendingMultisigs(getPendingMultisigSelector(base))
  if (!hit) {
    return
  }
  await pendingMultisigRepo.upsert({
    ...hit,
    hidden: true,
  })
}

export async function deletePendingMultisig(base: BasePendingMultisig) {
  await pendingMultisigRepo.remove((pendingMultisig) =>
    pendingMultisigEqual(pendingMultisig, base),
  )
}

export async function unhidePendingMultisig(
  base: BasePendingMultisig,
  hidden: boolean,
) {
  const [hit] = await getAllPendingMultisigs(getPendingMultisigSelector(base))
  if (!hit) {
    return
  }
  await pendingMultisigRepo.upsert({
    ...hit,
    hidden,
  })
}
