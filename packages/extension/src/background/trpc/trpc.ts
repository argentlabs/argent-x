import { initTRPC } from "@trpc/server"
import type { IStarknetAddressService } from "@argent/x-shared"
import { BaseError as SharedBaseError } from "@argent/x-shared"
import superjson from "superjson"

import type { IActivityCacheService } from "../../shared/activity/cache/IActivityCacheService"
import type { IFeeTokenService } from "../../shared/feeToken/service/IFeeTokenService"
import type { ILedgerSharedService } from "../../shared/ledger/service/ILedgerSharedService"
import type { INetworkService } from "../../shared/network/service/INetworkService"
import type { IPreAuthorizationService } from "../../shared/preAuthorization/IPreAuthorizationService"
import type { IRecoveryService } from "../../shared/recovery/IRecoveryService"
import type { IRiskAssessmentService } from "../../shared/riskAssessment/IRiskAssessmentService"
import type { ISignatureReviewService } from "../../shared/signatureReview/ISignatureReviewService"
import type { ISharedSwapService } from "../../shared/swap/service/ISharedSwapService"
import type { ITokenService } from "../../shared/token/__new/service/ITokenService"
import type { ITransactionReviewService } from "../../shared/transactionReview/interface"
import type { IUIService } from "../../shared/ui/IUIService"
import type { MessagingKeys } from "../keys/messagingKeys"
import type { IBackgroundActionService } from "../services/action/IBackgroundActionService"
import type { IBackgroundArgentAccountService } from "../services/argentAccount/IBackgroundArgentAccountService"
import type { IBackgroundMultisigService } from "../services/multisig/IBackgroundMultisigService"
import type { IOnboardingService } from "../../shared/onboarding/IOnboardingService"
import type { IBackgroundUIService } from "../services/ui/IBackgroundUIService"
import type { Wallet } from "../wallet"
import type { IAccountImportSharedService } from "../../shared/accountImport/service/IAccountImportSharedService"
import type { IOnRampService } from "../../shared/onRamp/IOnRampService"
import type { INotificationService } from "../../shared/notifications/INotificationService"
import type { IStakingService } from "../../shared/staking/IStakingService"
import type { IInvestmentService } from "../../shared/investments/IInvestmentService"

interface Context {
  sender?: chrome.runtime.MessageSender
  services: {
    wallet: Wallet
    actionService: IBackgroundActionService
    messagingKeys: MessagingKeys
    argentAccountService: IBackgroundArgentAccountService
    multisigService: IBackgroundMultisigService
    transactionReviewService: ITransactionReviewService
    recoveryService: IRecoveryService
    starknetAddressService: IStarknetAddressService
    swapService: ISharedSwapService
    tokenService: ITokenService
    feeTokenService: IFeeTokenService
    networkService: INetworkService
    riskAssessmentService: IRiskAssessmentService
    signatureReviewService: ISignatureReviewService
    preAuthorizationService: IPreAuthorizationService
    ledgerService: ILedgerSharedService
    activityCacheService: IActivityCacheService
    backgroundUIService: IBackgroundUIService
    uiService: IUIService
    onboardingService: IOnboardingService
    importAccountService: IAccountImportSharedService
    onRampService: IOnRampService
    notificationService: INotificationService
    stakingService: IStakingService
    investmentService: IInvestmentService
  }
}

const t = initTRPC.context<Context>().create({
  isServer: false,
  transformer: superjson,
  allowOutsideOfServer: true,
  errorFormatter: (opts) => {
    const { shape, error } = opts
    const { cause } = error

    if (cause instanceof SharedBaseError) {
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
    } else if (cause?.cause instanceof SharedBaseError) {
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
