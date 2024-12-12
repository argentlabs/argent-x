import type browser from "webextension-polyfill"

import type { IBackgroundActionService } from "./services/action/IBackgroundActionService"
import type { MessagingKeys } from "./keys/messagingKeys"
import type { Respond } from "./respond"
import type { Wallet } from "./wallet"
import type { TransactionTrackerWorker } from "./services/transactionTracker/worker/TransactionTrackerWorker"
import type { IFeeTokenService } from "../shared/feeToken/service/IFeeTokenService"

export interface BackgroundService {
  wallet: Wallet
  transactionTrackerWorker: TransactionTrackerWorker
  actionService: IBackgroundActionService
  feeTokenService: IFeeTokenService
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
