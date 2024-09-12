import {
  CallData,
  DeclareContractPayload,
  TransactionType,
  UniversalDeployerContractPayload,
  constants,
  num,
} from "starknet"

import { ExtQueueItem } from "../shared/actionQueue/types"
import { isAccountDeployed } from "./accountDeploy"
import { getNonce, increaseStoredNonce } from "./nonce"
import { addTransaction } from "../shared/transactions/store"
import { Wallet } from "./wallet"
import { AccountError } from "../shared/errors/account"
import { WalletError } from "../shared/errors/wallet"
import { UdcError } from "../shared/errors/udc"
import { checkTransactionHash } from "../shared/transactions/utils"
import { getEstimatedFees } from "../shared/transactionSimulation/fees/estimatedFeesRepository"
import { TransactionError } from "../shared/errors/transaction"
import {
  getTxVersionFromFeeToken,
  getTxVersionFromFeeTokenForDeclareContract,
  estimatedFeeToMaxResourceBounds,
} from "@argent/x-shared"
import { sanitizeAccountType } from "../shared/utils/sanitizeAccountType"

const { UDC } = constants

type DeclareContractAction = ExtQueueItem<{
  type: "DECLARE_CONTRACT"
  payload: DeclareContractPayload
}>

type DeployContractAction = ExtQueueItem<{
  type: "DEPLOY_CONTRACT"
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

  const preComputedFees = await getEstimatedFees({
    type: TransactionType.DECLARE,
    payload,
  })

  if (!preComputedFees) {
    throw new TransactionError({ code: "NO_PRE_COMPUTED_FEES" })
  }

  const version = getTxVersionFromFeeTokenForDeclareContract(
    preComputedFees.transactions.feeTokenAddress,
    payload,
  )

  const accountNeedsDeploy = !(await isAccountDeployed(
    selectedAccount,
    starknetAccount.getClassAt.bind(starknetAccount),
  ))

  const declareNonce = accountNeedsDeploy
    ? num.toHex(1)
    : await getNonce(selectedAccount, starknetAccount)

  if (accountNeedsDeploy && preComputedFees.deployment) {
    const { account, txHash: accountDeployTxHash } = await wallet.deployAccount(
      selectedAccount,
      {
        version,
        ...estimatedFeeToMaxResourceBounds(preComputedFees.deployment),
      },
    )

    if (!checkTransactionHash(accountDeployTxHash)) {
      throw new UdcError({ code: "DEPLOY_TX_NOT_ADDED" })
    }

    await addTransaction({
      hash: accountDeployTxHash,
      account,
      meta: {
        title: "Activate Account",
        isDeployAccount: true,
        type: TransactionType.DEPLOY_ACCOUNT,
        ampliProperties: {
          "is deployment": true,
          "transaction type": "deploy contract",
          "account index": account.index,
          "account type": sanitizeAccountType(account.type),
          "wallet platform": "browser extension",
        },
      },
    })
  }

  if ("declareIfNot" in starknetAccount) {
    const { transaction_hash: declareTxHash, class_hash: deployedClassHash } =
      await starknetAccount.declareIfNot(payload, {
        nonce: declareNonce,
        version,
        ...estimatedFeeToMaxResourceBounds(preComputedFees.transactions),
      })

    if (!checkTransactionHash(declareTxHash)) {
      throw new UdcError({ code: "CONTRACT_ALREADY_DECLARED" })
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
        ampliProperties: {
          "is deployment": false,
          "transaction type": "declare contract",
          "account index": selectedAccount.index,
          "account type": sanitizeAccountType(selectedAccount.type),
          "wallet platform": "browser extension",
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

  const preComputedFees = await getEstimatedFees({
    type: TransactionType.DEPLOY,
    payload,
  })

  if (!preComputedFees) {
    throw new TransactionError({ code: "NO_PRE_COMPUTED_FEES" })
  }

  const version = getTxVersionFromFeeToken(
    preComputedFees.transactions.feeTokenAddress,
  )

  const accountNeedsDeploy = !(await isAccountDeployed(
    selectedAccount,
    starknetAccount.getClassAt.bind(starknetAccount),
  ))

  const deployNonce = accountNeedsDeploy
    ? num.toHex(num.toBigInt(1))
    : await getNonce(selectedAccount, starknetAccount)

  if (accountNeedsDeploy && preComputedFees.deployment) {
    const { account, txHash: accountDeployTxHash } = await wallet.deployAccount(
      selectedAccount,
      {
        version,
        ...estimatedFeeToMaxResourceBounds(preComputedFees.deployment),
      },
    )

    if (!checkTransactionHash(accountDeployTxHash)) {
      throw new UdcError({ code: "DEPLOY_TX_NOT_ADDED" })
    }

    await addTransaction({
      hash: accountDeployTxHash,
      account,
      meta: {
        title: "Activate Account",
        isDeployAccount: true,
        type: "DEPLOY_ACCOUNT",
        ampliProperties: {
          "is deployment": true,
          "transaction type": "deploy contract",
          "account index": account.index,
          "account type": sanitizeAccountType(account.type),
          "wallet platform": "browser extension",
        },
      },
    })
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
          version,
          ...estimatedFeeToMaxResourceBounds(preComputedFees.transactions),
        },
      )

    if (!checkTransactionHash(deployTxHash)) {
      throw new UdcError({ code: "NO_DEPLOY_CONTRACT" })
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
        ampliProperties: {
          "is deployment": false,
          "transaction type": "deploy contract",
          "account index": selectedAccount.index,
          "account type": sanitizeAccountType(selectedAccount.type),
          "wallet platform": "browser extension",
        },
      },
    })

    // transaction added, lets increase the local nonce, so we can queue transactions if needed
    await increaseStoredNonce(selectedAccount)

    return { txHash: deployTxHash, contractAddress }
  }

  throw new UdcError({ code: "NO_STARKNET_DECLARE" })
}
