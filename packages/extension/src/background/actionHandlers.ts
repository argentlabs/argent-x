import { accountService } from "../shared/account/service"
import { ActionItem, ExtQueueItem } from "../shared/actionQueue/types"
import { MessageType } from "../shared/messages"
import { addNetwork, getNetworks } from "../shared/network"
import { preAuthorize } from "../shared/preAuthorizations"
import { isEqualWalletAddress } from "../shared/wallet.service"
import { assertNever } from "../ui/services/assertNever"
import { accountDeployAction } from "./accountDeployAction"
import { analytics } from "./analytics"
import { BackgroundService } from "./background"
import { multisigDeployAction } from "./multisigDeployAction"
import { openUi } from "./openUi"
import { executeTransactionAction } from "./transactions/transactionExecution"
import { udcDeclareContract, udcDeployContract } from "./udcAction"

export const handleActionApproval = async (
  action: ExtQueueItem<ActionItem>,
  background: BackgroundService,
): Promise<MessageType | undefined> => {
  const { wallet } = background
  const actionHash = action.meta.hash

  switch (action.type) {
    case "CONNECT_DAPP": {
      const { host } = action.payload
      const selectedAccount = await wallet.getSelectedAccount()

      if (!selectedAccount) {
        void openUi()
        return
      }

      void analytics.track("preauthorizeDapp", {
        host,
        networkId: selectedAccount.networkId,
      })

      await preAuthorize(selectedAccount, host)

      return { type: "CONNECT_DAPP_RES", data: selectedAccount }
    }

    case "TRANSACTION": {
      try {
        const response = await executeTransactionAction(action, background)

        return {
          type: "TRANSACTION_SUBMITTED",
          data: { txHash: response.transaction_hash, actionHash },
        }
      } catch (error: unknown) {
        return {
          type: "TRANSACTION_FAILED",
          data: { actionHash, error: `${error}` },
        }
      }
    }

    case "DEPLOY_ACCOUNT_ACTION": {
      try {
        const txHash = await accountDeployAction(action, background)

        void analytics.track("deployAccount", {
          status: "success",
          trigger: "sign",
          networkId: action.payload.networkId,
        })

        return {
          type: "DEPLOY_ACCOUNT_ACTION_SUBMITTED",
          data: { txHash, actionHash },
        }
      } catch (exception: unknown) {
        let error = `${exception}`
        if (error.includes("403")) {
          error = `${error}\n\nA 403 error means there's already something running on the selected port. On macOS, AirPlay is using port 5000 by default, so please try running your node on another port and changing the port in Argent X settings.`
        }

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
        const txHash = await multisigDeployAction(action, background)

        void analytics.track("deployMultisig", {
          status: "success",
          trigger: "transaction",
          networkId: action.payload.networkId,
        })

        return {
          type: "DEPLOY_MULTISIG_ACTION_SUBMITTED",
          data: { txHash, actionHash },
        }
      } catch (exception: unknown) {
        let error = `${exception}`
        if (error.includes("403")) {
          error = `${error}\n\nA 403 error means there's already something running on the selected port. On macOS, AirPlay is using port 5000 by default, so please try running your node on another port and changing the port in Argent X settings.`
        }

        void analytics.track("deployMultisig", {
          status: "failure",
          networkId: action.payload.networkId,
          errorMessage: `${error}`,
        })

        return {
          type: "DEPLOY_MULTISIG_ACTION_FAILED",
          data: { actionHash, error: `${error}` },
        }
      }
    }

    case "SIGN": {
      const typedData = action.payload
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }
      const starknetAccount = await wallet.getSelectedStarknetAccount()

      const signature = await starknetAccount.signMessage(typedData)

      return {
        type: "SIGNATURE_SUCCESS",
        data: {
          signature,
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

    case "REQUEST_SWITCH_CUSTOM_NETWORK": {
      try {
        const networks = await getNetworks()

        const { chainId } = action.payload

        const network = networks.find((n) => n.chainId === chainId)

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
        const { classHash, txHash } = await udcDeclareContract(
          action,
          background,
        )

        return {
          type: "DECLARE_CONTRACT_ACTION_SUBMITTED",
          data: { txHash, actionHash, classHash },
        }
      } catch (exception: unknown) {
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

    case "DEPLOY_CONTRACT_ACTION": {
      try {
        const { txHash, contractAddress } = await udcDeployContract(
          action,
          background,
        )

        return {
          type: "DEPLOY_CONTRACT_ACTION_SUBMITTED",
          data: {
            txHash,
            deployedContractAddress: contractAddress,
            actionHash,
          },
        }
      } catch (exception: unknown) {
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
  action: ExtQueueItem<ActionItem>,
  _: BackgroundService,
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
      return {
        type: "DEPLOY_MULTISIG_ACTION_FAILED",
        data: { actionHash },
      }
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
