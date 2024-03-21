import { Atom, atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { atomFromRepo } from "./implementation/atomFromRepo"
import { isEqualAddress } from "@argent/x-shared"
import {
  multisigBaseWalletRepo,
  multisigMetadataRepo,
  pendingMultisigRepo,
} from "../../shared/multisig/repository"
import { BaseMultisigWalletAccount } from "../../shared/wallet.model"
import { MultisigMetadata } from "../../shared/multisig/types"

const allMultisigMetadataAtom = atomFromRepo(multisigMetadataRepo)

export const allMultisigMetadataView = atom(async (get) => {
  const multisigMetadataList = await get(allMultisigMetadataAtom)
  return multisigMetadataList
})

export const publicKeyMultisigMetadataAtomFamily = (
  view: Atom<Promise<MultisigMetadata[]>>,
) =>
  atomFamily(
    (multisig: BaseMultisigWalletAccount | undefined) =>
      atom(async (get) => {
        const multisigMetadataList = await get(view)
        return multisigMetadataList.find((multisigMetadata) =>
          isEqualAddress(
            multisigMetadata?.multisigPublicKey,
            multisig?.publicKey,
          ),
        )
      }),
    (a, b) => a?.creator === b?.creator,
  )

export const publicKeyMultisigMetadataView =
  publicKeyMultisigMetadataAtomFamily(allMultisigMetadataView)

export const pendingMultisigsView = atomFromRepo(pendingMultisigRepo)

export const multisigBaseWalletView = atomFromRepo(multisigBaseWalletRepo)
