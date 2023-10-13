import { Call } from "starknet"
import { MultisigEntryPointType, MultisigTransactionType } from "../types"

export const getMultisigTransactionType = (transactions: Call[]) => {
  const entryPoints = transactions.map((tx) => tx.entrypoint)
  switch (true) {
    case entryPoints.includes(MultisigEntryPointType.ADD_SIGNERS): {
      return MultisigTransactionType.MULTISIG_ADD_SIGNERS
    }
    case entryPoints.includes(MultisigEntryPointType.CHANGE_THRESHOLD): {
      return MultisigTransactionType.MULTISIG_CHANGE_THRESHOLD
    }
    case entryPoints.includes(MultisigEntryPointType.REMOVE_SIGNERS): {
      return MultisigTransactionType.MULTISIG_REMOVE_SIGNERS
    }
    case entryPoints.includes(MultisigEntryPointType.REPLACE_SIGNER): {
      return MultisigTransactionType.MULTISIG_REPLACE_SIGNER
    }
    default: {
      return undefined
    }
  }
}
