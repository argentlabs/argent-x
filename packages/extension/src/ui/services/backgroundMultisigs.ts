import { utils } from "ethers"

import { sendMessage, waitForMessage } from "../../shared/messages"
import {
  AddOwnerMultisigPayload,
  RemoveOwnerMultisigPayload,
  UpdateMultisigThresholdPayload,
} from "../../shared/multisig/multisig.model"
import { MultisigData } from "../../shared/wallet.model"

export const createNewMultisigAccount = async (
  networkId: string,
  multisigPayload: MultisigData,
) => {
  const decodedSigners = multisigPayload.signers.map((signer) =>
    utils.hexlify(utils.base58.decode(signer)),
  )

  sendMessage({
    type: "NEW_MULTISIG_ACCOUNT",
    data: {
      networkId,
      signers: decodedSigners,
      threshold: multisigPayload.threshold,
      creator: multisigPayload.creator,
      publicKey: multisigPayload.publicKey,
    },
  })
  try {
    return await Promise.race([
      waitForMessage("NEW_MULTISIG_ACCOUNT_RES"),
      waitForMessage("NEW_MULTISIG_ACCOUNT_REJ").then(() => "error" as const),
    ])
  } catch {
    throw Error("Could not add new account")
  }
}

export const createNewPendingMultisig = async (networkId: string) => {
  sendMessage({ type: "NEW_PENDING_MULTISIG", data: { networkId } })

  try {
    return await Promise.race([
      waitForMessage("NEW_PENDING_MULTISIG_RES"),
      waitForMessage("NEW_PENDING_MULTISIG_REJ").then(() => "error" as const),
    ])
  } catch {
    throw Error("Could not add new pending multisig")
  }
}

export const addMultisigOwners = async (data: AddOwnerMultisigPayload) => {
  sendMessage({ type: "ADD_MULTISIG_OWNERS", data })

  const response = await Promise.race([
    waitForMessage("ADD_MULTISIG_OWNERS_RES"),
    waitForMessage("ADD_MULTISIG_OWNERS_REJ"),
  ])

  if (response && "error" in response) {
    throw new Error(response.error)
  }
}

export const updateMultisigThreshold = async (
  data: UpdateMultisigThresholdPayload,
) => {
  sendMessage({ type: "UPDATE_MULTISIG_THRESHOLD", data })

  const response = await Promise.race([
    waitForMessage("UPDATE_MULTISIG_THRESHOLD_RES"),
    waitForMessage("UPDATE_MULTISIG_THRESHOLD_REJ"),
  ])

  if (response && "error" in response) {
    throw new Error(response.error)
  }
}

export const removeMultisigOwner = async (data: RemoveOwnerMultisigPayload) => {
  sendMessage({ type: "REMOVE_MULTISIG_OWNER", data })

  const response = await Promise.race([
    waitForMessage("REMOVE_MULTISIG_OWNER_RES"),
    waitForMessage("REMOVE_MULTISIG_OWNER_REJ"),
  ])

  if (response && "error" in response) {
    throw new Error(response.error)
  }
}

export const addMultisigTransactionSignature = async (requestId: string) => {
  sendMessage({
    type: "ADD_MULTISIG_TRANSACTION_SIGNATURE",
    data: { requestId },
  })

  const response = await Promise.race([
    waitForMessage("ADD_MULTISIG_TRANSACTION_SIGNATURE_RES"),
    waitForMessage("ADD_MULTISIG_TRANSACTION_SIGNATURE_REJ"),
  ])
  if ("error" in response) {
    throw new Error(response.error)
  }

  return response.txHash
}
