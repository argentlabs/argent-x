import { stark } from "starknet"

import { accountService } from "../shared/account/service"
import { ExtensionActionItem } from "../shared/actionQueue/types"
import { MessageType } from "../shared/messages"
import { networkService } from "../shared/network/service"
import { preAuthorize } from "../shared/preAuthorizations"
import { isEqualWalletAddress } from "../shared/wallet.service"
import { assertNever } from "../ui/services/assertNever"
import { accountDeployAction } from "./accountDeployAction"
import { analytics } from "./analytics"
import { multisigDeployAction } from "./multisig/multisigDeployAction"
import { openUi } from "./openUi"
import { executeTransactionAction } from "./transactions/transactionExecution"
import { udcDeclareContract, udcDeployContract } from "./udcAction"
import { Wallet } from "./wallet"

export const handleActionApproval = async (
  action: ExtensionActionItem,
  wallet: Wallet,
): Promise<MessageType | undefined> => {
  const actionHash = action.meta.hash
  const selectedAccount = await wallet.getSelectedAccount()
  const networkId = selectedAccount?.networkId || "unknown"

  switch (action.type) {
    case "CONNECT_DAPP": {
      const { host } = action.payload

      if (!selectedAccount) {
        void openUi()
        return
      }

      void analytics.track("preauthorizeDapp", {
        host,
        networkId,
      })

      await preAuthorize(selectedAccount, host)

      return { type: "CONNECT_DAPP_RES", data: selectedAccount }
    }

    case "TRANSACTION": {
      const host = action.meta.origin
      try {
        void analytics.track("signedTransaction", {
          networkId,
          host,
        })

        const response = await executeTransactionAction(action, wallet)

        void analytics.track("sentTransaction", {
          success: true,
          networkId,
          host,
        })

        return {
          type: "TRANSACTION_SUBMITTED",
          data: { txHash: response.transaction_hash, actionHash },
        }
      } catch (error) {
        void analytics.track("sentTransaction", {
          success: false,
          networkId,
          host,
        })

        return {
          type: "TRANSACTION_FAILED",
          data: { actionHash, error: `${error}` },
        }
      }
    }

    case "DEPLOY_ACCOUNT_ACTION": {
      try {
        void analytics.track("signedTransaction", {
          networkId,
        })

        const txHash = await accountDeployAction(action, wallet)

        void analytics.track("deployAccount", {
          status: "success",
          trigger: "sign",
          networkId: action.payload.networkId,
        })

        void analytics.track("sentTransaction", {
          success: true,
          networkId,
        })

        return {
          type: "DEPLOY_ACCOUNT_ACTION_SUBMITTED",
          data: { txHash, actionHash },
        }
      } catch (exception) {
        let error = `${exception}`
        if (error.includes("403")) {
          error = `${error}\n\nA 403 error means there's already something running on the selected port. On macOS, AirPlay is using port 5000 by default, so please try running your node on another port and changing the port in Argent X settings.`
        }

        void analytics.track("sentTransaction", {
          success: false,
          networkId,
        })

        void analytics.track("deployAccount", {
          status: "failure",
          networkId: action.payload.networkId,
          errorMessage: `${error}`,
        })

        return {
          type: "DEPLOY_ACCOUNT_ACTION_FAILED",
          data: { actionHash, error: `${error}` },
        }
      }
    }

    case "DEPLOY_MULTISIG_ACTION": {
      try {
        void analytics.track("signedTransaction", {
          networkId,
        })

        const txHash = await multisigDeployAction(action, wallet)

        void analytics.track("deployMultisig", {
          status: "success",
          trigger: "transaction",
          networkId: action.payload.networkId,
        })

        void analytics.track("sentTransaction", {
          success: true,
          networkId,
        })
        break
      } catch (exception) {
        let error = `${exception}`
        console.error(error)
        if (error.includes("403")) {
          error = `${error}\n\nA 403 error means there's already something running on the selected port. On macOS, AirPlay is using port 5000 by default, so please try running your node on another port and changing the port in Argent X settings.`
        }

        void analytics.track("sentTransaction", {
          success: false,
          networkId,
        })

        void analytics.track("deployMultisig", {
          status: "failure",
          networkId: action.payload.networkId,
          errorMessage: `${error}`,
        })
        break
      }
    }

    case "SIGN": {
      const {
        typedData,
        options: { skipDeploy = false },
      } = action.payload
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }
      const starknetAccount = await wallet.getSelectedStarknetAccount()
      const selectedAccount = await wallet.getSelectedAccount()

      const signature = await starknetAccount.signMessage(typedData)
      const formattedSignature = stark.signatureToDecimalArray(signature)

      await analytics.track("signedMessage", {
        networkId: selectedAccount?.networkId || "unknown",
      })

      return {
        type: "SIGNATURE_SUCCESS",
        data: {
          signature: formattedSignature,
          actionHash,
        },
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
        await networkService.add(action.payload)
        return {
          type: "APPROVE_REQUEST_ADD_CUSTOM_NETWORK",
          data: { actionHash },
        }
      } catch (error) {
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

        if (!accountsOnNetwork.length) {
          throw Error(`No accounts found on network with chainId ${chainId}`)
        }

        const currentlySelectedAccount = await wallet.getSelectedAccount()

        const existingAccountOnNetwork =
          currentlySelectedAccount &&
          accountsOnNetwork.find((account) =>
            isEqualWalletAddress(account, currentlySelectedAccount),
          )

        const selectedAccount = await wallet.selectAccount(
          existingAccountOnNetwork ?? accountsOnNetwork[0],
        )

        if (!selectedAccount) {
          throw Error(`No accounts found on network with chainId ${chainId}`)
        }

        return {
          type: "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK",
          data: { actionHash, selectedAccount },
        }
      } catch (error) {
        return {
          type: "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
          data: { actionHash },
        }
      }
    }

    case "DECLARE_CONTRACT_ACTION": {
      try {
        void analytics.track("signedDeclareTransaction", {
          networkId,
        })

        const { classHash, txHash } = await udcDeclareContract(action, wallet)

        void analytics.track("sentTransaction", {
          success: true,
          networkId,
        })

        return {
          type: "DECLARE_CONTRACT_ACTION_SUBMITTED",
          data: { txHash, actionHash, classHash },
        }
      } catch (exception) {
        let error = `${exception}`
        if (error.includes("403")) {
          error = `${error}\n\nA 403 error means there's already something running on the selected port. On macOS, AirPlay is using port 5000 by default, so please try running your node on another port and changing the port in Argent X settings.`
        }

        void analytics.track("sentTransaction", {
          success: false,
          networkId,
        })

        return {
          type: "DECLARE_CONTRACT_ACTION_FAILED",
          data: { actionHash, error: `${error}` },
        }
      }
    }

    case "DEPLOY_CONTRACT_ACTION": {
      try {
        void analytics.track("signedDeployTransaction", {
          networkId,
        })

        const { txHash, contractAddress } = await udcDeployContract(
          action,
          wallet,
        )

        void analytics.track("sentTransaction", {
          success: true,
          networkId,
        })

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

        void analytics.track("sentTransaction", {
          success: false,
          networkId,
        })

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

    case "DEPLOY_ACCOUNT_ACTION": {
      return {
        type: "DEPLOY_ACCOUNT_ACTION_FAILED",
        data: { actionHash },
      }
    }

    case "DEPLOY_MULTISIG_ACTION": {
      break
    }

    case "SIGN": {
      return {
        type: "SIGNATURE_FAILURE",
        data: { actionHash },
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

    case "DECLARE_CONTRACT_ACTION": {
      return {
        type: "REQUEST_DECLARE_CONTRACT_REJ",
        data: { actionHash },
      }
    }
    case "DEPLOY_CONTRACT_ACTION": {
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
