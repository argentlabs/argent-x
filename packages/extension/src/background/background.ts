import browser from "webextension-polyfill"

import { IBackgroundActionService } from "./__new/services/action/interface"
import type { MessagingKeys } from "./keys/messagingKeys"
import type { Respond } from "./respond"
import { Wallet } from "./wallet"
import { TransactionTrackerWorker } from "./transactions/service/starknet.service"

export interface BackgroundService {
  wallet: Wallet
  transactionTrackerWorker: TransactionTrackerWorker
  actionService: IBackgroundActionService
}

export class UnhandledMessage extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, UnhandledMessage.prototype)
  }
}

interface HandlerParams<T> {
  msg: T
  sender: browser.runtime.MessageSender
  origin: string
  port?: browser.runtime.Port
  background: BackgroundService
  messagingKeys: MessagingKeys
  respond: Respond
}

export type HandleMessage<T> = (params: HandlerParams<T>) => Promise<unknown>
