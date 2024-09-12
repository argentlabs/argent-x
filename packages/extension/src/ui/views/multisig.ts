import { Atom, atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { isEqualAddress } from "@argent/x-shared"
import {
  multisigBaseWalletRepo,
  multisigMetadataRepo,
  pendingMultisigRepo,
} from "../../shared/multisig/repository"
import { MultisigMetadata } from "../../shared/multisig/types"
import { BaseMultisigWalletAccount } from "../../shared/wallet.model"
import { atomFromRepo } from "./implementation/atomFromRepo"

const allMultisigMetadataAtom = atomFromRepo(multisigMetadataRepo)

export const allMultisigMetadataView = atom(async (get) => {
  return await get(allMultisigMetadataAtom)
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
