import { ActionItem } from "../shared/actionQueue"
import { MessageType } from "../shared/messages"
import { Queue } from "./actionQueue"
import { KeyPair } from "./keys/communication"
import { TransactionTracker } from "./transactions/transactions"
import { Wallet } from "./wallet"

export interface BackgroundService {
  wallet: Wallet
  transactionTracker: TransactionTracker
}

export class UnhandledMessage extends Error {
  constructor() {
    super()
  }
}

interface HandlerParams {
  msg: MessageType
  sender: chrome.runtime.MessageSender
  background: BackgroundService
  actionQueue: Queue<ActionItem>
  keyPair: KeyPair
  sendToTabAndUi: (msg: MessageType) => Promise<void>
}

export type HandleMessage = (params: HandlerParams) => Promise<unknown>
