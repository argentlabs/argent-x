import { getMessage } from "@extend-chrome/messages"
import type { JWK } from "jose"
import type { typedData } from "starknet"

import { ExtensionActionItem } from "../actionQueue"
import { Network, NetworkStatus } from "../networks"
import { RequestToken, Token } from "../token"
import { WalletAccount } from "../wallet.model"
import { AccountMessage } from "./AccountMessage"
import { PreAuthorisationMessage } from "./PreAuthorisationMessage"
import { TransactionMessage } from "./TransactionMessage"

export type MessageType =
  | AccountMessage
  | TransactionMessage
  | PreAuthorisationMessage
  // ***** sessions *****
  | { type: "STOP_SESSION" }
  | { type: "HAS_SESSION" }
  | { type: "HAS_SESSION_RES"; data: boolean }
  | { type: "IS_INITIALIZED" }
  | {
      type: "IS_INITIALIZED_RES"
      data: { initialized: boolean; hasLegacy: boolean }
    }
  | { type: "START_SESSION"; data: { secure: true; body: string } }
  | { type: "START_SESSION_REJ" }
  | { type: "START_SESSION_RES"; data?: WalletAccount }
  | { type: "LOADING_PROGRESS"; data: number }
  | { type: "CHECK_PASSWORD"; data: { body: string } }
  | { type: "CHECK_PASSWORD_REJ" }
  | { type: "CHECK_PASSWORD_RES" }
  // ***** backup *****
  | { type: "RECOVER_BACKUP"; data: string }
  | { type: "RECOVER_BACKUP_RES" }
  | { type: "RECOVER_BACKUP_REJ"; data: string }
  | { type: "RECOVER_SEEDPHRASE"; data: { secure: true; body: string } }
  | { type: "RECOVER_SEEDPHRASE_RES" }
  | { type: "RECOVER_SEEDPHRASE_REJ" }
  | { type: "DOWNLOAD_BACKUP_FILE" }
  | { type: "DOWNLOAD_BACKUP_FILE_RES" }
  | { type: "DOWNLOAD_LEGACY_BACKUP_FILE" }
  | { type: "DOWNLOAD_LEGACY_BACKUP_FILE_RES" }
  // ***** tokens *****
  | { type: "GET_TOKENS" }
  | { type: "GET_TOKENS_RES"; data: Token[] }
  | { type: "UPDATE_TOKENS"; data: Token[] }
  | { type: "REMOVE_TOKEN"; data: Token["address"] }
  | { type: "REMOVE_TOKEN_RES"; data: boolean }
  | { type: "ADD_TOKEN"; data: Token }
  | { type: "ADD_TOKEN_RES"; data: boolean }
  | { type: "ADD_TOKEN_REJ" }
  // - used by dapps to request tokens
  | { type: "REQUEST_TOKEN"; data: RequestToken }
  | { type: "REQUEST_TOKEN_RES"; data: { actionHash?: string } } // returns no actionHash if the token already exists
  | { type: "REJECT_REQUEST_TOKEN"; data: { actionHash: string } }
  | { type: "APPROVE_REQUEST_TOKEN"; data: { actionHash: string } }

  // ***** networks *****
  | { type: "GET_CUSTOM_NETWORKS" }
  | { type: "GET_CUSTOM_NETWORKS_RES"; data: Network[] }
  | { type: "ADD_CUSTOM_NETWORKS"; data: Network[] }
  | { type: "ADD_CUSTOM_NETWORKS_RES"; data: Network[] }
  | { type: "REMOVE_CUSTOM_NETWORKS"; data: Network["id"][] }
  | { type: "REMOVE_CUSTOM_NETWORKS_RES"; data: Network[] }
  | { type: "GET_NETWORK_STATUSES"; data?: Network[] } // allows ui to get specific network statuses and defaults to all
  | {
      type: "GET_NETWORK_STATUSES_RES"
      data: Partial<Record<Network["id"], NetworkStatus>>
    }

  // - used by dapps to request addition of custom network
  | { type: "REQUEST_ADD_CUSTOM_NETWORK"; data: Network }
  | { type: "REQUEST_ADD_CUSTOM_NETWORK_RES"; data: { actionHash?: string } }
  | { type: "REJECT_REQUEST_ADD_CUSTOM_NETWORK"; data: { actionHash: string } }
  | { type: "APPROVE_REQUEST_ADD_CUSTOM_NETWORK"; data: { actionHash: string } }

  // - used by dapps to request switching of already added custom network
  | {
      type: "REQUEST_SWITCH_CUSTOM_NETWORK"
      data: { chainId: Network["chainId"] }
    }
  | { type: "REQUEST_SWITCH_CUSTOM_NETWORK_RES"; data: { actionHash?: string } }
  | {
      type: "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK"
      data: { actionHash: string }
    }
  | {
      type: "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK"
      data: { actionHash: string }
    }

  // ***** actions *****
  | { type: "GET_ACTIONS" }
  | {
      type: "GET_ACTIONS_RES"
      data: ExtensionActionItem[]
    }
  | { type: "APPROVE_ACTION"; data: { actionHash: string } }
  | { type: "REJECT_ACTION"; data: { actionHash: string } }
  | {
      type: "ACTIONS_QUEUE_UPDATE"
      data: { actions: ExtensionActionItem[] }
    }
  | { type: "SIGN_MESSAGE"; data: typedData.TypedData }
  | { type: "SIGN_MESSAGE_RES"; data: { actionHash: string } }
  | { type: "SIGNATURE_FAILURE"; data: { actionHash: string } }
  | {
      type: "SIGNATURE_SUCCESS"
      data: { r: string; s: string; actionHash: string }
    }
  // ***** misc *****
  | { type: "OPEN_UI" }
  | { type: "RESET_ALL" }
  | { type: "GET_PUBLIC_KEY" }
  | { type: "GET_PUBLIC_KEY_RES"; data: JWK }
  | {
      type: "GET_ENCRYPTED_SEED_PHRASE"
      data: {
        encryptedSecret: string
      }
    }
  | {
      type: "GET_ENCRYPTED_SEED_PHRASE_RES"
      data: {
        encryptedSeedPhrase: string
      }
    }

export type WindowMessageType = MessageType & {
  forwarded?: boolean
  extensionId: string
}

export const [sendMessage, messageStream, _waitForMessage] =
  getMessage<MessageType>("ARGENTX")

export async function waitForMessage<
  K extends MessageType["type"],
  T extends { type: K } & MessageType,
>(
  type: K,
  predicate: (x: T) => boolean = () => true,
): Promise<T extends { data: any } ? T["data"] : undefined> {
  return _waitForMessage(
    ([msg]: any) => msg.type === type && predicate(msg),
  ).then(([msg]: any) => msg.data)
}
