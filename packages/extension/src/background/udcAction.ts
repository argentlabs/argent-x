import {
  DeclareContractPayload,
  UniversalDeployerContractPayload,
  constants,
  stark,
} from "starknet"

import { ExtQueueItem } from "../shared/actionQueue/types"
import { BackgroundService } from "./background"
import { getNonce, increaseStoredNonce } from "./nonce"
import { addTransaction } from "./transactions/store"
import { checkTransactionHash } from "./transactions/transactionExecution"

const { UDC } = constants

type DeclareContractAction = ExtQueueItem<{
  type: "DECLARE_CONTRACT_ACTION"
  payload: DeclareContractPayload
}>

type DeployContractAction = ExtQueueItem<{
  type: "DEPLOY_CONTRACT_ACTION"
  payload: UniversalDeployerContractPayload
}>

export enum UdcTransactionType {
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

    // check if contract was already declared
    try {
      const deployed = await starknetAccount.getClassByHash(classHash)
      if (deployed) {
        console.warn(`Contract already declared at ${classHash}`) // TODO: add into last declared contracts store if not already there
        return null
      }
    } catch {
      // contract was not deployed yet, pass
    }

    const nonce = await getNonce(account, wallet)
    const { transaction_hash: txHash } = await starknetAccount.declare(
      {
        classHash,
        contract,
      },
      {
        nonce,
      },
    )

    if (!checkTransactionHash(txHash)) {
      throw Error(
        "Deploy Account Transaction could not be added to the sequencer",
      )
    }

    await increaseStoredNonce(account)

    await addTransaction({
      hash: txHash,
      account,
      meta: {
        title: "Contract declared",
        subTitle: classHash.toString(),
        type: UdcTransactionType.DECLARE_CONTRACT,
        transactions: {
          contractAddress: UDC.ADDRESS,
          entrypoint: "declareContract",
        },
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

  if ("deploy" in starknetAccount) {
    const { classHash, salt, unique, constructorCalldata } = payload

    // make sure contract hashes can be calculated before submitting onchain
    const compiledConstructorCallData = stark.compileCalldata(
      constructorCalldata || [],
    )

    // submit onchain
    const nonce = await getNonce(account, wallet)
    const { transaction_hash: txHash, contract_address } =
      await starknetAccount.deploy(
        {
          classHash,
          salt,
          unique,
          constructorCalldata,
        },
        {
          nonce,
        },
      )

    if (!checkTransactionHash(txHash)) {
      throw Error(
        "Deploy Account Transaction could not be added to the sequencer",
      )
    }

    const contractAddress = contract_address[0]
    await addTransaction({
      hash: txHash,
      account,
      meta: {
        title: "Contract deployment",
        subTitle: contractAddress,
        type: UdcTransactionType.DEPLOY_CONTRACT,
        transactions: {
          contractAddress: UDC.ADDRESS,
          entrypoint: "deployContract",
          calldata: compiledConstructorCallData,
        },
      },
    })

    // transaction added, lets increase the local nonce, so we can queue transactions if needed
    await increaseStoredNonce(account)

    return { txHash, contractAddress }
  }

  throw Error("Account does not support Starknet declare")
}
