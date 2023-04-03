import {
  DeclareContractPayload,
  TransactionBulk,
  UniversalDeployerContractPayload,
  constants,
  number,
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
  let maxDeclareFee = "0"

  const declareNonce = selectedAccount.needsDeploy
    ? number.toHex(number.toBN(1))
    : await getNonce(selectedAccount, wallet)

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
      maxDeclareFee = argentMaxFee(estimateFeeBulk[1].suggestedMaxFee)
    }
    const { account, txHash: accountDeployTxHash } = await wallet.deployAccount(
      selectedAccount,
      {
        maxFee: maxADFee,
      },
    )

    if (!checkTransactionHash(accountDeployTxHash)) {
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
      hash: accountDeployTxHash,
      account,
      meta: {
        title: "Activate Account",
        isDeployAccount: true,
        type: "DEPLOY_ACCOUNT",
      },
    })
  } else {
    if ("getSuggestedMaxFee" in starknetAccount) {
      const suggestedMaxFee = await starknetAccount.getSuggestedMaxFee(
        {
          type: "DECLARE",
          payload: {
            classHash: payload.classHash,
            contract: payload.contract,
          },
        },
        {
          nonce: declareNonce,
        },
      )
      maxDeclareFee = argentMaxFee(suggestedMaxFee)
    } else {
      throw Error("Account does not support Starknet Declare Fee")
    }
  }

  if ("declare" in starknetAccount) {
    const { classHash, contract } = payload

    const { transaction_hash: declareTxHash, class_hash: deployedClassHash } =
      await starknetAccount.declare(
        {
          classHash,
          contract,
        },
        {
          nonce: declareNonce,
          maxFee: maxDeclareFee,
        },
      )

    if (!checkTransactionHash(declareTxHash)) {
      throw Error(
        "Deploy Account Transaction could not be added to the sequencer",
      )
    }

    await increaseStoredNonce(selectedAccount)

    await addTransaction({
      hash: declareTxHash,
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

    return { txHash: declareTxHash, classHash: deployedClassHash }
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
  let maxDeployFee = "0"

  const deployNonce = selectedAccount.needsDeploy
    ? number.toHex(number.toBN(1))
    : await getNonce(selectedAccount, wallet)

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
      maxDeployFee = argentMaxFee(estimateFeeBulk[1].suggestedMaxFee)
    }
    const { account, txHash: accountDeployTxHash } = await wallet.deployAccount(
      selectedAccount,
      {
        maxFee: maxADFee,
      },
    )

    if (!checkTransactionHash(accountDeployTxHash)) {
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
      hash: accountDeployTxHash,
      account,
      meta: {
        title: "Activate Account",
        isDeployAccount: true,
        type: "DEPLOY_ACCOUNT",
      },
    })
  } else {
    if ("getSuggestedMaxFee" in starknetAccount) {
      const suggestedMaxFee = await starknetAccount.getSuggestedMaxFee(
        {
          type: "DEPLOY",
          payload: {
            classHash: payload.classHash,
            constructorCalldata: payload.constructorCalldata,
            salt: payload.salt,
            unique: payload.unique,
          },
        },
        {
          nonce: deployNonce,
        },
      )
      maxDeployFee = argentMaxFee(suggestedMaxFee)
    } else {
      throw Error("Account does not support Starknet Deploy Fee")
    }
  }

  if ("deploy" in starknetAccount) {
    const { classHash, salt, unique, constructorCalldata } = payload

    // make sure contract hashes can be calculated before submitting onchain
    const compiledConstructorCallData = stark.compileCalldata(
      constructorCalldata || [],
    )

    // submit onchain
    const { transaction_hash: deployTxHash, contract_address } =
      await starknetAccount.deploy(
        {
          classHash,
          salt,
          unique,
          constructorCalldata,
        },
        {
          nonce: deployNonce,
          maxFee: maxDeployFee,
        },
      )

    if (!checkTransactionHash(deployTxHash)) {
      throw Error(
        "Deploy Account Transaction could not be added to the sequencer",
      )
    }

    const contractAddress = contract_address[0]
    await addTransaction({
      hash: deployTxHash,
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

    return { txHash: deployTxHash, contractAddress }
  }

  throw Error("Account does not support Starknet declare")
}
