import {
  DeclareContractPayload,
  UniversalDeployerContractPayload,
  stark,
} from "starknet"
import { hash } from "starknet"

import { ExtQueueItem } from "../shared/actionQueue/types"
import { BackgroundService } from "./background"
import { addTransaction } from "./transactions/store"
import { checkTransactionHash } from "./transactions/transactionExecution"

const { calculateContractAddressFromHash } = hash

type DeclareContractAction = ExtQueueItem<{
  type: "DECLARE_CONTRACT_ACTION"
  payload: DeclareContractPayload
}>

type DeployContractAction = ExtQueueItem<{
  type: "DEPLOY_CONTRACT_ACTION"
  payload: UniversalDeployerContractPayload
}>

export enum UcdTransactionType {
  DEPLOY_CONTRACT = "DEPLOY",
  DECLARE_CONTRACT = "DECLARE",
}

export const udcDeclareContract = async (
  { payload }: DeclareContractAction,
  { wallet }: BackgroundService,
) => {
  if (!(await wallet.isSessionOpen())) {
    throw Error("you need an open session")
  }
  const account = await wallet.getSelectedAccount()
  if (!account) {
    throw new Error("No account selected")
  }

  const starknetAccount = await wallet.getStarknetAccount({
    address: account.address,
    networkId: account.networkId,
  })

  if ("declare" in starknetAccount) {
    const { classHash, contract } = payload
    const { transaction_hash: txHash } = await starknetAccount.declare({
      classHash,
      contract,
    })

    if (!checkTransactionHash(txHash)) {
      throw Error(
        "Deploy Account Transaction could not be added to the sequencer",
      )
    }

    await addTransaction({
      hash: txHash,
      account,
      meta: {
        title: "Contract declared",
        subTitle: classHash.toString(),
        type: UcdTransactionType.DECLARE_CONTRACT,
      },
    })

    return txHash
  }

  throw Error("Account does not support Starknet declare")
}

export const udcDeployContract = async (
  { payload }: DeployContractAction,
  { wallet }: BackgroundService,
) => {
  if (!(await wallet.isSessionOpen())) {
    throw Error("you need an open session")
  }

  const account = await wallet.getSelectedAccount()
  if (!account) {
    throw new Error("No account selected")
  }

  const starknetAccount = await wallet.getStarknetAccount({
    address: account.address,
    networkId: account.networkId,
  })

  if ("declare" in starknetAccount) {
    const { classHash, salt, unique, constructorCalldata } = payload
    const { transaction_hash: txHash } = await starknetAccount.deploy({
      classHash,
      salt,
      unique,
      constructorCalldata,
    })

    if (!checkTransactionHash(txHash)) {
      throw Error(
        "Deploy Account Transaction could not be added to the sequencer",
      )
    }

    const compiledConstructorCallData = stark.compileCalldata(
      constructorCalldata || [],
    )
    const contractAddress = calculateContractAddressFromHash(
      salt,
      classHash,
      compiledConstructorCallData,
      account.address,
    )

    await addTransaction({
      hash: txHash,
      account,
      meta: {
        title: "Contract deployed",
        subTitle: contractAddress,
        type: UcdTransactionType.DEPLOY_CONTRACT,
      },
    })

    return txHash
  }

  throw Error("Account does not support Starknet declare")
}
