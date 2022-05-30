import { ActionItem } from "../shared/actionQueue"
import { MessageType } from "../shared/messages"
import { Queue } from "./actionQueue"
import { KeyPair } from "./keys/communication"
import { TransactionTracker } from "./transactions/transactions"
import { Wallet } from "./wallet"

export interface BackgroundService {
  wallet: Wallet
  transactionTracker: TransactionTracker
  actionQueue: Queue<ActionItem>
}

export class UnhandledMessage extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, UnhandledMessage.prototype)
  }
}

interface HandlerParams<T> {
  msg: T
  sender: chrome.runtime.MessageSender
  background: BackgroundService
  keyPair: KeyPair
  sendToTabAndUi: (msg: MessageType) => Promise<void>
}

export type HandleMessage<T> = (params: HandlerParams<T>) => Promise<unknown>
