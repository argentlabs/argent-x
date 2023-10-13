import { Atom, atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { atomFromRepo } from "./implementation/atomFromRepo"
import { isEqualAddress } from "@argent/shared"
import { multisigMetadataRepo } from "../../shared/multisig/repository"
import { BaseMultisigWalletAccount } from "../../shared/wallet.model"
import { MultisigMetadata } from "../../shared/multisig/types"

const allMultisigMetadataAtom = atomFromRepo(multisigMetadataRepo)

export const allMultisigMetadataView = atom(async (get) => {
  const multisigMetadataList = await get(allMultisigMetadataAtom)
  return multisigMetadataList
})

export const creatorMultisigMetadataAtomFamily = (
  view: Atom<Promise<MultisigMetadata[]>>,
) =>
  atomFamily(
    (multisig: BaseMultisigWalletAccount | undefined) =>
      atom(async (get) => {
        const multisigMetadataList = await get(view)
        return multisigMetadataList.find((multisigMetadata) =>
          isEqualAddress(multisigMetadata?.creator, multisig?.creator),
        )
      }),
    (a, b) => a?.creator === b?.creator,
  )

export const creatorMultisigMetadataView = creatorMultisigMetadataAtomFamily(
  allMultisigMetadataView,
)
