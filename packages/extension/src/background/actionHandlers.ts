import { ActionItem } from "../shared/actionQueue"
import { MessageType } from "../shared/messages"
import { assertNever } from "../ui/services/assertNever"
import { ExtQueueItem } from "./actionQueue"
import { analytics } from "./analytics"
import { BackgroundService } from "./background"
import { openUi } from "./openUi"
import { preAuthorize } from "./preAuthorizations"
import { executeTransaction } from "./transactions/transactionExecution"

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
        openUi()
        return
      }

      analytics.track("preauthorizeDapp", {
        host,
        networkId: selectedAccount.networkId,
      })

      await preAuthorize({
        host,
        accountAddress: selectedAccount.address,
      })

      return { type: "CONNECT_DAPP_RES", data: selectedAccount }
    }

    case "TRANSACTION": {
      try {
        const response = await executeTransaction(action, background)

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

    case "SIGN": {
      const typedData = action.payload
      if (!wallet.isSessionOpen()) {
        throw Error("you need an open session")
      }
      const starknetAccount = await wallet.getSelectedStarknetAccount()

      const [r, s] = await starknetAccount.signMessage(typedData)

      return {
        type: "SIGNATURE_SUCCESS",
        data: {
          r: r.toString(),
          s: s.toString(),
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
      return {
        type: "APPROVE_REQUEST_ADD_CUSTOM_NETWORK",
        data: { actionHash },
      }
    }

    case "REQUEST_SWITCH_CUSTOM_NETWORK": {
      return {
        type: "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK",
        data: { actionHash },
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

    default:
      assertNever(action)
  }
}
