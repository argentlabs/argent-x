import {
  DeclareContractPayload,
  TransactionBulk,
  UniversalDeployerContractPayload,
  constants,
  stark,
} from "starknet"

import { ExtQueueItem } from "../shared/actionQueue/types"
import { isAccountDeployed } from "./accountDeploy"
import { analytics } from "./analytics"
import { BackgroundService } from "./background"
import { getNonce, increaseStoredNonce } from "./nonce"
import { addTransaction } from "./transactions/store"
import { checkTransactionHash } from "./transactions/transactionExecution"
import { argentMaxFee } from "./utils/argentMaxFee"

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
  const selectedAccount = await wallet.getSelectedAccount()
  if (!selectedAccount) {
    throw new Error("No account selected")
  }

  const starknetAccount = await wallet.getStarknetAccount({
    address: selectedAccount.address,
    networkId: selectedAccount.networkId,
  })

  let maxADFee = "0"

  if (
    selectedAccount.needsDeploy &&
    !(await isAccountDeployed(selectedAccount, starknetAccount.getClassAt))
  ) {
    if ("estimateFeeBulk" in starknetAccount) {
      const bulkTransactions: TransactionBulk = [
        {
          type: "DEPLOY_ACCOUNT",
          payload: await wallet.getAccountDeploymentPayload(selectedAccount),
        },
        {
          type: "DECLARE",
          payload: {
            classHash: payload.classHash,
            contract: payload.contract,
          },
        },
      ]
      const estimateFeeBulk = await starknetAccount.estimateFeeBulk(
        bulkTransactions,
      )

      maxADFee = argentMaxFee(estimateFeeBulk[0].suggestedMaxFee)
    }
    const { account, txHash } = await wallet.deployAccount(selectedAccount, {
      maxFee: maxADFee,
    })

    if (!checkTransactionHash(txHash)) {
      throw Error(
        "Deploy Account Transaction could not get added to the sequencer",
      )
    }

    analytics.track("deployAccount", {
      status: "success",
      trigger: "transaction",
      networkId: account.networkId,
    })

    await addTransaction({
      hash: txHash,
      account,
      meta: {
        title: "Activate Account",
        isDeployAccount: true,
      },
    })
  }

  if ("declare" in starknetAccount) {
    const { classHash, contract } = payload

    const nonce = await getNonce(selectedAccount, wallet)
    const { transaction_hash: txHash, class_hash: deployedClassHash } =
      await starknetAccount.declare(
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

    await increaseStoredNonce(selectedAccount)

    await addTransaction({
      hash: txHash,
      account: selectedAccount,
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

    return { txHash, classHash: deployedClassHash }
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

  const selectedAccount = await wallet.getSelectedAccount()
  if (!selectedAccount) {
    throw new Error("No account selected")
  }

  const starknetAccount = await wallet.getStarknetAccount({
    address: selectedAccount.address,
    networkId: selectedAccount.networkId,
  })

  let maxADFee = "0"

  if (
    selectedAccount.needsDeploy &&
    !(await isAccountDeployed(selectedAccount, starknetAccount.getClassAt))
  ) {
    if ("estimateFeeBulk" in starknetAccount) {
      const bulkTransactions: TransactionBulk = [
        {
          type: "DEPLOY_ACCOUNT",
          payload: await wallet.getAccountDeploymentPayload(selectedAccount),
        },
        {
          type: "DEPLOY",
          payload: {
            classHash: payload.classHash,
            constructorCalldata: payload.constructorCalldata,
            salt: payload.salt,
            unique: payload.unique,
          },
        },
      ]
      const estimateFeeBulk = await starknetAccount.estimateFeeBulk(
        bulkTransactions,
      )

      maxADFee = argentMaxFee(estimateFeeBulk[0].suggestedMaxFee)
    }
    const { account, txHash } = await wallet.deployAccount(selectedAccount, {
      maxFee: maxADFee,
    })

    if (!checkTransactionHash(txHash)) {
      throw Error(
        "Deploy Account Transaction could not get added to the sequencer",
      )
    }

    analytics.track("deployAccount", {
      status: "success",
      trigger: "transaction",
      networkId: account.networkId,
    })

    await addTransaction({
      hash: txHash,
      account,
      meta: {
        title: "Activate Account",
        isDeployAccount: true,
      },
    })
  }

  if ("deploy" in starknetAccount) {
    const { classHash, salt, unique, constructorCalldata } = payload

    // make sure contract hashes can be calculated before submitting onchain
    const compiledConstructorCallData = stark.compileCalldata(
      constructorCalldata || [],
    )

    // submit onchain
    const nonce = await getNonce(selectedAccount, wallet)
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
      account: selectedAccount,
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
    await increaseStoredNonce(selectedAccount)

    return { txHash, contractAddress }
  }

  throw Error("Account does not support Starknet declare")
}
