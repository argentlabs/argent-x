import { UniversalDeployerContractPayload } from "starknet"
import { sendMessage, waitForMessage } from "../../shared/messages"
import { DeclareContract } from "../../shared/udc/type"
import { UdcError } from "../../shared/errors/udc"

export const declareContract = async (data: DeclareContract) => {
  void sendMessage({
    type: "REQUEST_DECLARE_CONTRACT",
    data,
  })
  try {
    await Promise.race([
      waitForMessage("REQUEST_DECLARE_CONTRACT_RES"),
      waitForMessage("REQUEST_DECLARE_CONTRACT_REJ").then(() => {
        throw new Error("Rejected")
      }),
    ])
  } catch {
    throw new UdcError({ code: "NO_DECLARE_CONTRACT" })
  }
}

export interface DeployContractServicePayload
  extends UniversalDeployerContractPayload {
  address: string
  networkId: string
}

export const deployContract = async ({
  address,
  networkId,
  classHash,
  constructorCalldata,
  salt,
  unique,
}: DeployContractServicePayload) => {
  sendMessage({
    type: "REQUEST_DEPLOY_CONTRACT",
    data: {
      address,
      networkId,
      classHash,
      constructorCalldata,
      salt,
      unique,
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
    throw new UdcError({ code: "NO_DEPLOY_CONTRACT" })
  }
}
