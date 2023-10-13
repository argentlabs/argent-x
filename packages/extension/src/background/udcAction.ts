import {
  CallData,
  DeclareContractPayload,
  Invocations,
  TransactionType,
  UniversalDeployerContractPayload,
  constants,
  num,
} from "starknet"

import { ExtQueueItem } from "../shared/actionQueue/types"
import { isAccountDeployed } from "./accountDeploy"
import { analytics } from "./analytics"
import { getNonce, increaseStoredNonce } from "./nonce"
import { addTransaction } from "./transactions/store"
import { checkTransactionHash } from "./transactions/transactionExecution"
import { argentMaxFee } from "./utils/argentMaxFee"
import { Wallet } from "./wallet"
import { AccountError } from "../shared/errors/account"
import { WalletError } from "../shared/errors/wallet"
import { UdcError } from "../shared/errors/udc"

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
  wallet: Wallet,
) => {
  if (!(await wallet.isSessionOpen())) {
    throw new WalletError({ code: "NO_SESSION_OPEN" })
  }
  const selectedAccount = await wallet.getSelectedAccount()
  if (!selectedAccount) {
    throw new AccountError({ code: "NOT_SELECTED" })
  }

  const starknetAccount = await wallet.getStarknetAccount({
    address: selectedAccount.address,
    networkId: selectedAccount.networkId,
  })

  let maxADFee = "0"
  let maxDeclareFee = "0"

  const declareNonce = selectedAccount.needsDeploy
    ? num.toHex(1)
    : await getNonce(selectedAccount, starknetAccount)

  if (
    selectedAccount.needsDeploy &&
    !(await isAccountDeployed(
      selectedAccount,
      starknetAccount.getClassAt.bind(starknetAccount),
    ))
  ) {
    if ("estimateFeeBulk" in starknetAccount) {
      const bulkTransactions: Invocations = [
        {
          type: TransactionType.DEPLOY_ACCOUNT,
          payload: await wallet.getAccountDeploymentPayload(selectedAccount),
        },
        {
          type: TransactionType.DECLARE,
          payload,
        },
      ]
      const estimateFeeBulk = await starknetAccount.estimateFeeBulk(
        bulkTransactions,
        { skipValidate: true },
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
      throw new UdcError({ code: "DEPLOY_TX_NOT_ADDED" })
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
        type: TransactionType.DEPLOY_ACCOUNT,
      },
    })
  } else {
    if ("getSuggestedMaxFee" in starknetAccount) {
      const suggestedMaxFee = await starknetAccount.getSuggestedMaxFee(
        {
          type: TransactionType.DECLARE,
          payload,
        },
        {
          nonce: declareNonce,
        },
      )
      maxDeclareFee = argentMaxFee(suggestedMaxFee)
    } else {
      throw new UdcError({ code: "NO_STARKNET_DECLARE_FEE" })
    }
  }

  if ("declareIfNot" in starknetAccount) {
    const { transaction_hash: declareTxHash, class_hash: deployedClassHash } =
      await starknetAccount.declareIfNot(payload, {
        nonce: declareNonce,
        maxFee: maxDeclareFee,
      })

    if (!checkTransactionHash(declareTxHash)) {
      throw new UdcError({ code: "DEPLOY_TX_NOT_ADDED" })
    }

    await increaseStoredNonce(selectedAccount)

    await addTransaction({
      hash: declareTxHash,
      account: selectedAccount,
      meta: {
        title: "Contract declared",
        subTitle: payload.classHash || payload.compiledClassHash,
        type: UdcTransactionType.DECLARE_CONTRACT,
        transactions: {
          contractAddress: UDC.ADDRESS,
          entrypoint: "declareContract",
        },
      },
    })

    return { txHash: declareTxHash, classHash: deployedClassHash }
  }
  throw new UdcError({ code: "NO_STARKNET_DECLARE" })
}

export const udcDeployContract = async (
  { payload }: DeployContractAction,
  wallet: Wallet,
) => {
  if (!(await wallet.isSessionOpen())) {
    throw new WalletError({ code: "NO_SESSION_OPEN" })
  }

  const selectedAccount = await wallet.getSelectedAccount()
  if (!selectedAccount) {
    throw new AccountError({ code: "NOT_SELECTED" })
  }

  const starknetAccount = await wallet.getStarknetAccount({
    address: selectedAccount.address,
    networkId: selectedAccount.networkId,
  })

  let maxADFee = "0"
  let maxDeployFee = "0"

  const deployNonce = selectedAccount.needsDeploy
    ? num.toHex(num.toBigInt(1))
    : await getNonce(selectedAccount, starknetAccount)

  if (
    selectedAccount.needsDeploy &&
    !(await isAccountDeployed(
      selectedAccount,
      starknetAccount.getClassAt.bind(starknetAccount),
    ))
  ) {
    if ("estimateFeeBulk" in starknetAccount) {
      const bulkTransactions: Invocations = [
        {
          type: TransactionType.DEPLOY_ACCOUNT,
          payload: await wallet.getAccountDeploymentPayload(selectedAccount),
        },
        {
          type: TransactionType.DEPLOY,
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
        { skipValidate: true },
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
      throw new UdcError({ code: "DEPLOY_TX_NOT_ADDED" })
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
          type: TransactionType.DEPLOY,
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
      throw new UdcError({ code: "NO_STARKNET_DECLARE_FEE" })
    }
  }

  if ("deploy" in starknetAccount) {
    const { classHash, salt, unique, constructorCalldata } = payload

    // make sure contract hashes can be calculated before submitting onchain
    const compiledConstructorCallData = CallData.toCalldata(constructorCalldata)

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
      throw new UdcError({ code: "DEPLOY_TX_NOT_ADDED" })
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

  throw new UdcError({ code: "NO_STARKNET_DECLARE" })
}
