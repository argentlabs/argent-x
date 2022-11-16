import { sendMessage, waitForMessage } from "../../shared/messages"

export const declareContract = async (
  address: string,
  classHash: string,
  contract: string,
  networkId: string,
) => {
  sendMessage({
    type: "REQUEST_DECLARE_CONTRACT",
    data: {
      address,
      classHash,
      contract,
      networkId,
    },
  })
  try {
    await Promise.race([
      waitForMessage("REQUEST_DECLARE_CONTRACT_RES"),
      waitForMessage("REQUEST_DECLARE_CONTRACT_REJ").then(() => {
        throw new Error("Rejected")
      }),
    ])
  } catch {
    throw Error("Could not declare contract")
  }
}

/* TODO: complete */
export const deployContract = async (address: string, networkId: string) => {
  sendMessage({
    type: "REQUEST_DEPLOY_CONTRACT",
    data: {
      address,
      networkId,
    },
  })
  try {
    await Promise.race([
      waitForMessage("REQUEST_DEPLOY_CONTRACT_RES"),
      waitForMessage("REQUEST_DEPLOY_CONTRACT_REJ").then(() => {
        throw new Error("Rejected")
      }),
    ])
  } catch {
    throw Error("Could not declare contract")
  }
}
