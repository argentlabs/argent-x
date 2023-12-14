import { initTRPC } from "@trpc/server"

import type { IArgentAccountServiceBackground } from "../../shared/argentAccount/service/interface"
import { BaseError } from "../../shared/errors/baseError"
import { BaseError as SharedBaseError } from "@argent/shared"
import type { IMultisigService } from "../../shared/multisig/service/messaging/interface"
import { MessagingKeys } from "../keys/messagingKeys"
import { Wallet } from "../wallet"
import type { IBackgroundActionService } from "./services/action/interface"
import type { ITransactionReviewService } from "../../shared/transactionReview/interface"
import type { IRecoveryService } from "../../shared/recovery/service/interface"
import type { IStarknetAddressService } from "@argent/shared"
import type { INetworkService } from "../../shared/network/service/interface"

interface Context {
  sender?: chrome.runtime.MessageSender
  services: {
    wallet: Wallet
    actionService: IBackgroundActionService
    messagingKeys: MessagingKeys
    argentAccountService: IArgentAccountServiceBackground
    multisigService: IMultisigService
    transactionReviewService: ITransactionReviewService
    recoveryService: IRecoveryService
    starknetAddressService: IStarknetAddressService
    networkService: INetworkService
  }
}

const t = initTRPC.context<Context>().create({
  isServer: false,
  allowOutsideOfServer: true,
  errorFormatter: (opts) => {
    const { shape, error } = opts
    const { cause } = error

    if (cause instanceof BaseError || cause instanceof SharedBaseError) {
      return {
        ...shape,
        data: {
          ...shape.data,
          code: cause.code,
          name: cause.name,
          message: cause.message,
          context: cause.context,
        },
      }
    } else if (
      cause?.cause instanceof BaseError ||
      cause?.cause instanceof SharedBaseError
    ) {
      // The production build is nesting the error in another cause
      const nestedCause = cause.cause

      return {
        ...shape,
        data: {
          ...shape.data,
          code: nestedCause.code,
          name: nestedCause.name,
          message: nestedCause.message,
          context: nestedCause.context,
        },
      }
    }

    return shape
  },
})

export const router = t.router
export const procedure = t.procedure
export const middleware = t.middleware
