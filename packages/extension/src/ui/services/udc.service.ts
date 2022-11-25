import { ContractClass } from "starknet"

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

interface DeployContractService {
  address: string
  networkId: string
  classHash: string
  constructorCalldata: any
  salt: string
  unique: boolean
}

export const deployContract = async ({
  address,
  networkId,
  classHash,
  constructorCalldata,
  salt,
  unique,
}: DeployContractService) => {
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
    throw Error("Could not declare contract")
  }
}

export const fetchConstructorParams = async (
  classHash: string,
  networkId: string,
): Promise<ContractClass> => {
  sendMessage({
    type: "FETCH_CONSTRUCTOR_PARAMS",
    data: {
      classHash,
      networkId,
    },
  })
  try {
    const result = await Promise.race([
      waitForMessage("FETCH_CONSTRUCTOR_PARAMS_RES"),
      waitForMessage("FETCH_CONSTRUCTOR_PARAMS_REJ").then(() => {
        throw new Error("Rejected")
      }),
    ])
    return result.contract
  } catch {
    throw Error("Could not fetch contract constructor params")
  }
}
