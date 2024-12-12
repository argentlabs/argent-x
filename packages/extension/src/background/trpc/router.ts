import { createChromeHandler } from "trpc-browser/adapter"

import { getMessagingKeys } from "../keys/messagingKeys"
import { walletSingleton } from "../walletSingleton"
import { accountRouter } from "./procedures/account"
import { accountMessagingRouter } from "./procedures/accountMessaging"
import { actionRouter } from "./procedures/action"
import { addressBookRouter } from "./procedures/addressBook"
import { argentAccountRouter } from "./procedures/argentAccount"
import { multisigRouter } from "./procedures/multisig"
import { recoveryRouter } from "./procedures/recovery"
import { sessionRouter } from "./procedures/session"
import { tokensRouter } from "./procedures/tokens"
import { transactionReviewRouter } from "./procedures/transactionReview"
import { transferRouter } from "./procedures/transfer"
import { udcRouter } from "./procedures/udc"
import { backgroundActionService } from "../services/action"
import { backgroundArgentAccountService } from "../services/argentAccount"
import { backgroundMultisigService } from "../services/multisig"
import { backgroundTransactionReviewService } from "../services/transactionReview"
import { router } from "./trpc"
import { swapRouter } from "./procedures/swap"
import { backgroundRecoveryService } from "../services/recovery"
import { addressRouter } from "./procedures/address"
import { backgroundStarknetAddressService } from "../services/address"
import { networkService } from "../../shared/network/service"
import { sharedSwapService } from "../../shared/swap/service"
import { transactionEstimateRouter } from "./procedures/transactionEstimate"
import { tokenService } from "../../shared/token/__new/service"
import { riskAssessmentRouter } from "./procedures/riskAssessment"
import { riskAssessmentService } from "../services/riskAssessment"
import { feeTokenService } from "../../shared/feeToken/service"
import { feeTokenRouter } from "./procedures/feeToken"
import { discoverRouter } from "./procedures/discover"
import { signatureReviewRouter } from "./procedures/signatureReview"
import { signatureReviewService } from "../services/signatureReview"
import { preAuthorizationService } from "../../shared/preAuthorization"
import { ledgerSharedService } from "../../shared/ledger/service"
import { ledgerRouter } from "./procedures/ledger"
import { activityCacheService } from "../services/activity/cache"
import { activityCacheRouter } from "./procedures/activity/cache"
import { dappMessagingRouter } from "./procedures/dappMessaging"
import { backgroundUIService } from "../services/ui"
import { uiService } from "../../shared/ui"
import { onboardingRouter } from "./procedures/onboarding"
import { onboardingService } from "../services/onboarding"
import { preAuthorizationRouter } from "./procedures/preAuthorization"
import { accountImportSharedService } from "../../shared/accountImport/service"
import { importAccountRouter } from "./procedures/importAccount"
import { onRampRouter } from "./procedures/onramp"
import { onRampService } from "../services/onRamp"
import { notificationsRouter } from "./procedures/notifications"
import { notificationService } from "../services/notifications"
import { uiRouter } from "./procedures/ui"
import { stakingService } from "../services/staking"
import { stakingRouter } from "./procedures/staking"
import { investmentService } from "../services/investments"
import { investmentsRouter } from "./procedures/investments"

const appRouter = router({
  account: accountRouter,
  accountMessaging: accountMessagingRouter,
  action: actionRouter,
  address: addressRouter,
  addressBook: addressBookRouter,
  argentAccount: argentAccountRouter,
  multisig: multisigRouter,
  recovery: recoveryRouter,
  session: sessionRouter,
  swap: swapRouter,
  tokens: tokensRouter,
  transactionEstimate: transactionEstimateRouter,
  transactionReview: transactionReviewRouter,
  signatureReview: signatureReviewRouter,
  transfer: transferRouter,
  udc: udcRouter,
  riskAssessment: riskAssessmentRouter,
  feeToken: feeTokenRouter,
  discover: discoverRouter,
  ledger: ledgerRouter,
  activityCache: activityCacheRouter,
  dappMessaging: dappMessagingRouter,
  onboarding: onboardingRouter,
  preAuthorization: preAuthorizationRouter,
  importAccount: importAccountRouter,
  onramp: onRampRouter,
  notifications: notificationsRouter,
  ui: uiRouter,
  staking: stakingRouter,
  investments: investmentsRouter,
})

export type AppRouter = typeof appRouter

createChromeHandler({
  router: appRouter,
  createContext: async ({ req: port }) => ({
    sender: port.sender, // changes on every request
    services: {
      // services can be shared accross requests, as we usually only handle one user at a time
      wallet: walletSingleton, // wallet "service" is obviously way too big and should be split up
      actionService: backgroundActionService,
      messagingKeys: await getMessagingKeys(),
      argentAccountService: backgroundArgentAccountService,
      multisigService: backgroundMultisigService,
      recoveryService: backgroundRecoveryService,
      transactionReviewService: backgroundTransactionReviewService,
      swapService: sharedSwapService,
      starknetAddressService: backgroundStarknetAddressService,
      tokenService,
      feeTokenService,
      networkService,
      riskAssessmentService,
      signatureReviewService,
      preAuthorizationService,
      ledgerService: ledgerSharedService,
      activityCacheService,
      backgroundUIService,
      uiService,
      onboardingService,
      importAccountService: accountImportSharedService,
      onRampService,
      notificationService,
      stakingService,
      investmentService,
    },
  }),
})
