import {
  MultiSigner,
  changeGuardianCalldataSchema,
  getArgentAccountWithMultiSignerClassHashes,
  getSignerForMultiSigner,
  isEqualAddress,
} from "@argent/x-shared"
import {
  CairoOption,
  CairoOptionVariant,
  CallData,
  constants,
  num,
} from "starknet"

import { WalletAccount } from "../wallet.model"

export const getChangeGuardianCalldataForAccount = ({
  account,
  guardian,
}: {
  account: WalletAccount
  guardian: string
}) => {
  const supportsMultiSigner = getArgentAccountWithMultiSignerClassHashes().some(
    (ch) => isEqualAddress(ch, account.classHash),
  )
  return getChangeGuardianCalldata({
    supportsMultiSigner,
    guardian,
  })
}

export const getChangeGuardianCalldata = ({
  supportsMultiSigner,
  guardian,
}: {
  supportsMultiSigner: boolean
  guardian: string
}) => {
  const newGuardian = num.hexToDecimalString(guardian)
  const isRemoveGuardian = num.toBigInt(newGuardian) === constants.ZERO
  if (!supportsMultiSigner) {
    return changeGuardianCalldataSchema.parse([newGuardian])
  }
  const guardianAsOption = isRemoveGuardian
    ? new CairoOption(CairoOptionVariant.None, null)
    : new CairoOption(
        CairoOptionVariant.Some,
        getSignerForMultiSigner(guardian, MultiSigner.Starknet),
      )
  return CallData.compile([guardianAsOption])
}
