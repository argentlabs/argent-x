import { initTRPC } from "@trpc/server"

import { ActionItem } from "../../shared/actionQueue/types"
import { Queue } from "../actionQueue"
import { TransactionTracker } from "../transactions/tracking"
import { Wallet } from "../wallet"

interface Context {
  sender?: chrome.runtime.MessageSender
  services: {
    wallet: Wallet
    actionQueue: Queue<ActionItem>
    transactionTracker: TransactionTracker
  }
}

const t = initTRPC.context<Context>().create({
  isServer: false,
  allowOutsideOfServer: true,
})

export const router = t.router
export const procedure = t.procedure
export const middleware = t.middleware
