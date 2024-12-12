import { TXV3_ACCOUNT_CLASS_HASH } from "@argent/x-shared"
import { stark } from "starknet"
import { accountService } from "../shared/account/service"
import type { ExtensionActionItem } from "../shared/actionQueue/types"
import { ampli } from "../shared/analytics"
import type { MessageType } from "../shared/messages"
import { multisigArraySignatureSchema } from "../shared/multisig/multisig.model"
import { networkSchema } from "../shared/network"
import { networkService } from "../shared/network/service"
import { preAuthorizationService } from "../shared/preAuthorization"
import { assertNever } from "../shared/utils/assertNever"
import { isEqualWalletAddress } from "../shared/wallet.service"
import { accountDeployAction } from "./accountDeployAction"
import { addMultisigDeployAction } from "./multisig/multisigDeployAction"
import type { TransactionAction } from "./transactions/transactionExecution"
import { executeTransactionAction } from "./transactions/transactionExecution"
import { udcDeclareContract, udcDeployContract } from "./udcAction"
import type { Wallet } from "./wallet"
import { respondToHost } from "./respond"
import { backgroundUIService } from "./services/ui"
import { isNetworkOnlyPlaceholderAccount } from "../shared/wallet.model"
import type { ActionItemExtra } from "../shared/actionQueue/schema"
import { validateSignatureChainId } from "../shared/utils/validateSignatureChainId"
import { addTransactionHash } from "../shared/transactions/transactionHashes/transactionHashesRepository"

const handleTransactionAction = async ({
  action,
  wallet,
}: {
  action: TransactionAction
  networkId: string
  wallet: Wallet
}): Promise<MessageType> => {
  const actionHash = action.meta.hash

  try {
    const response = await executeTransactionAction(action, wallet)

    return {
      type: "TRANSACTION_SUBMITTED",
      data: { txHash: response.transaction_hash, actionHash },
    }
  } catch (error) {
    return {
      type: "TRANSACTION_FAILED",
      data: { actionHash, error: `${error}` },
    }
  }
}

export const handleActionApproval = async (
  action: ExtensionActionItem,
  wallet: Wallet,
  extra?: ActionItemExtra,
): Promise<MessageType | undefined> => {
  const actionHash = action.meta.hash
  const selectedAccount = await wallet.getSelectedAccount()
  const networkId = selectedAccount?.networkId || "unknown"

  switch (action.type) {
    case "CONNECT_DAPP": {
      const { host } = action.payload

      if (!selectedAccount) {
        void backgroundUIService.openUi()
        return
      }

      await preAuthorizationService.add({
        account: selectedAccount,
        host,
      })
      ampli.dappPreauthorized({
        host,
        "preauthorisation status": "accept",
        "wallet platform": "browser extension",
      })

      // `CONNECT_ACCOUNT_RES` triggers `handleConnect` inpage for this specific host, triggering dapp `accountsChanged` listeners
      await respondToHost(
        { type: "CONNECT_ACCOUNT_RES", data: selectedAccount },
        host,
      )
      return { type: "CONNECT_DAPP_RES", data: selectedAccount }
    }

    case "TRANSACTION": {
      return handleTransactionAction({
        action,
        networkId,
        wallet,
      })
    }

    case "DEPLOY_ACCOUNT": {
      try {
        const txHash = await accountDeployAction(action, wallet, extra)

        return {
          type: "DEPLOY_ACCOUNT_ACTION_SUBMITTED",
          data: { txHash, actionHash },
        }
      } catch (exception) {
        let error = `${exception}`
        if (error.includes("403")) {
          error = `${error}\n\nA 403 error means there's already something running on the selected port. On macOS, AirPlay is using port 5000 by default, so please try running your node on another port and changing the port in Argent X settings.`
        }

        return {
          type: "DEPLOY_ACCOUNT_ACTION_FAILED",
          data: { actionHash, error: `${error}` },
        }
      }
    }

    case "DEPLOY_MULTISIG": {
      try {
        await addMultisigDeployAction(action, wallet, extra)

        break
      } catch (exception) {
        let error = `${exception}`
        console.error(error)
        if (error.includes("403")) {
          error = `${error}\n\nA 403 error means there's already something running on the selected port. On macOS, AirPlay is using port 5000 by default, so please try running your node on another port and changing the port in Argent X settings.`
        }

        return {
          type: "DEPLOY_MULTISIG_ACTION_FAILED",
          data: { actionHash, error: `${error}` },
        }
      }
    }

    case "SIGN": {
      const { typedData } = action.payload
      if (!(await wallet.isSessionOpen())) {
        throw new Error("you need an open session")
      }
      const starknetAccount = await wallet.getSelectedStarknetAccount()
      const selectedAccount = await wallet.getSelectedAccount()

      if (!selectedAccount) {
        return {
          type: "SIGNATURE_FAILURE",
          data: {
            error: "No selected account",
            actionHash,
          },
        }
      }

      const validateSignatureChainIdResult = validateSignatureChainId(
        selectedAccount,
        typedData,
      )

      if (!validateSignatureChainIdResult.success) {
        return {
          type: "SIGNATURE_FAILURE",
          data: {
            error: validateSignatureChainIdResult.error,
            actionHash,
          },
        }
      }

      try {
        const messageHash = await starknetAccount.hashMessage(typedData)
        await addTransactionHash(actionHash, messageHash)
        const signature = await starknetAccount.signMessage(typedData)
        let formattedSignature

        if (selectedAccount.type === "multisig") {
          const multisigAccount = await wallet.getMultisigAccount(
            selectedAccount.id,
          )

          // Should be [requestId, signer, r, s]
          const parsedSignature =
            multisigArraySignatureSchema.safeParse(signature)

          if (!parsedSignature.success)
            throw new Error("Invalid signature format")

          const [requestId, ...multisigSignature] = parsedSignature.data

          if (multisigAccount.threshold > 1) {
            return {
              type: "SIGNATURES_PENDING",
              data: { requestId, actionHash },
            }
          }

          formattedSignature = stark.signatureToDecimalArray(multisigSignature)
        } else {
          formattedSignature = stark.signatureToDecimalArray(signature)
        }

        return {
          type: "SIGNATURE_SUCCESS",
          data: {
            signature: formattedSignature,
            actionHash,
          },
        }
      } catch (error) {
        console.error(error)
        return {
          type: "SIGNATURE_FAILURE",
          data: {
            error: `${error}`,
            actionHash,
          },
        }
      }
    }

    case "REQUEST_TOKEN": {
      return {
        type: "APPROVE_REQUEST_TOKEN",
        data: { actionHash },
      }
    }

    case "REQUEST_ADD_CUSTOM_NETWORK": {
      try {
        const parsedNetwork = networkSchema.parse(action.payload)
        await networkService.add({
          ...parsedNetwork,
          accountClassHash: {
            // Add default class hashes
            standard: TXV3_ACCOUNT_CLASS_HASH,
          },
        })
        return {
          type: "APPROVE_REQUEST_ADD_CUSTOM_NETWORK",
          data: { actionHash },
        }
      } catch {
        return {
          type: "REJECT_REQUEST_ADD_CUSTOM_NETWORK",
          data: { actionHash },
        }
      }
    }

    case "REQUEST_SWITCH_CUSTOM_NETWORK": {
      try {
        const { chainId } = action.payload

        const network = await networkService.getByChainId(chainId)

        if (!network) {
          throw Error(`Network with chainId ${chainId} not found`)
        }

        const accountsOnNetwork = await accountService.get((account) => {
          return account.networkId === network.id && !account.hidden
        })
        let newAccount
        if (!accountsOnNetwork.length) {
          // assuming we have only default accounts on custom networks
          newAccount = await wallet.newAccount(network.id, "standard")
        }

        const currentlySelectedAccount = await wallet.getSelectedAccount()

        const existingAccountOnNetwork =
          currentlySelectedAccount &&
          accountsOnNetwork.find((account) =>
            isEqualWalletAddress(account, currentlySelectedAccount),
          )

        const account =
          existingAccountOnNetwork ?? accountsOnNetwork[0] ?? newAccount

        const selectedAccount = await wallet.selectAccount(account.id)

        if (isNetworkOnlyPlaceholderAccount(selectedAccount)) {
          throw Error(`No accounts found on network with chainId ${chainId}`)
        }
        return {
          type: "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK",
          data: { actionHash, selectedAccount },
        }
      } catch {
        return {
          type: "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
          data: { actionHash },
        }
      }
    }

    case "DECLARE_CONTRACT": {
      try {
        const { classHash, txHash } = await udcDeclareContract(action, wallet)
        return {
          type: "DECLARE_CONTRACT_ACTION_SUBMITTED",
          data: { txHash, actionHash, classHash },
        }
      } catch (exception) {
        let error = `${exception}`
        if (error.includes("403")) {
          error = `${error}\n\nA 403 error means there's already something running on the selected port. On macOS, AirPlay is using port 5000 by default, so please try running your node on another port and changing the port in Argent X settings.`
        }

        return {
          type: "DECLARE_CONTRACT_ACTION_FAILED",
          data: { actionHash, error: `${error}` },
        }
      }
    }

    case "DEPLOY_CONTRACT": {
      try {
        const { txHash, contractAddress } = await udcDeployContract(
          action,
          wallet,
        )

        return {
          type: "DEPLOY_CONTRACT_ACTION_SUBMITTED",
          data: {
            txHash,
            deployedContractAddress: contractAddress,
            actionHash,
          },
        }
      } catch (exception) {
        let error = `${exception}`
        if (error.includes("403")) {
          error = `${error}\n\nA 403 error means there's already something running on the selected port. On macOS, AirPlay is using port 5000 by default, so please try running your node on another port and changing the port in Argent X settings.`
        }

        return {
          type: "DEPLOY_CONTRACT_ACTION_FAILED",
          data: { actionHash, error: `${error}` },
        }
      }
    }

    default:
      assertNever(action)
  }
}

export const handleActionRejection = async (
  action: ExtensionActionItem,
): Promise<MessageType | undefined> => {
  const actionHash = action.meta.hash

  switch (action.type) {
    case "CONNECT_DAPP": {
      const { host } = action.payload
      ampli.dappPreauthorized({
        host,
        "preauthorisation status": "reject",
        "wallet platform": "browser extension",
      })
      return {
        type: "REJECT_PREAUTHORIZATION",
        data: {
          host: action.payload.host,
          actionHash,
        },
      }
    }

    case "TRANSACTION": {
      return {
        type: "TRANSACTION_FAILED",
        data: { actionHash },
      }
    }

    case "DEPLOY_ACCOUNT": {
      return {
        type: "DEPLOY_ACCOUNT_ACTION_FAILED",
        data: { actionHash },
      }
    }

    case "DEPLOY_MULTISIG": {
      return {
        type: "DEPLOY_MULTISIG_ACTION_FAILED",
        data: { actionHash },
      }
    }

    case "SIGN": {
      return {
        type: "SIGNATURE_FAILURE",
        data: { actionHash, error: "User rejected" },
      }
    }

    case "REQUEST_TOKEN": {
      return {
        type: "REJECT_REQUEST_TOKEN",
        data: { actionHash },
      }
    }

    case "REQUEST_ADD_CUSTOM_NETWORK": {
      return {
        type: "REJECT_REQUEST_ADD_CUSTOM_NETWORK",
        data: { actionHash },
      }
    }

    case "REQUEST_SWITCH_CUSTOM_NETWORK": {
      return {
        type: "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
        data: { actionHash },
      }
    }

    case "DECLARE_CONTRACT": {
      return {
        type: "REQUEST_DECLARE_CONTRACT_REJ",
        data: { actionHash },
      }
    }
    case "DEPLOY_CONTRACT": {
      return {
        type: "REQUEST_DEPLOY_CONTRACT_REJ",
        data: { actionHash },
      }
    }

    /* TODO: add deploy */

    default:
      assertNever(action)
  }
}
