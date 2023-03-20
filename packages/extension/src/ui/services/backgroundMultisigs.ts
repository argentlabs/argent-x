import { utils } from "ethers"

import { sendMessage, waitForMessage } from "../../shared/messages"
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
