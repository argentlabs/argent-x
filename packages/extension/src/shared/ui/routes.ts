import { isNil, isString, omitBy } from "lodash-es"

import type { AddressBookContact } from "../addressBook/type"
import type { Flow } from "../argentAccount/schema"
import type { LedgerStartContext } from "../ledger/schema"
import type { SendQuery } from "../send/schema"
import type { CreateAccountType, SignerType, AccountId } from "../wallet.model"

export const route = <T extends (..._: any[]) => string>(
  ...[value, path]: [routeAndPath: string] | [routeWithParams: T, path: string]
): T & { path: string } => {
  if (isString(value)) {
    return Object.defineProperty((() => value) as any, "path", { value })
  }
  return Object.defineProperty(value as any, "path", { value: path })
}

/** a route function with a `returnTo` query parameter */

export const routeWithReturnTo = (route: string) => {
  const returnTo = (returnTo?: string) =>
    returnTo ? `${route}?returnTo=${encodeURIComponent(returnTo)}` : route
  returnTo.path = route
  return returnTo
}

/** like URLSearchParams.toString() but omits undefined, null */
export const qs = (query?: Record<string, string>) => {
  const cleanedQuery = omitBy(query, isNil)
  return new URLSearchParams(cleanedQuery).toString()
}

export const routes = {
  onboardingStart: route("/onboarding/start"),
  onboardingDisclaimer: route("/onboarding/disclaimer"),
  onboardingPrivacy: route(
    (path: "password" | "seedphrase") => `/onboarding/privacy/${path}`,
    `/onboarding/privacy/:path`,
  ),
  onboardingPassword: route("/onboarding/password"),
  onboardingFinish: route("/onboarding/finish"),
  onboardingRestoreBackup: route("/onboarding/restore/backup"),
  onboardingRestoreSeed: route("/onboarding/restore/seed"),
  onboardingRestorePassword: route("/onboarding/restore/password"),
  onboardingAccountType: route("/onboarding/account-type"),
  onboardingSmartAccountEmail: route("/onboarding/smart-account/email"),
  onboardingSmartAccountOTP: route(
    (email: string) =>
      `/onboarding/smart-account/otp?email=${encodeURIComponent(email)}`,
    "onboarding/smart-account/otp/",
  ),
  setupRecovery: routeWithReturnTo("/recovery"),
  setupSeedRecovery: routeWithReturnTo("/recovery/seed"),
  confirmSeedRecovery: routeWithReturnTo("/recovery/seed/confirm"),
  accountTokens: route("/account/tokens"),
  accountCollections: route("/account/collections"),
  accountActivity: route("/account/activity"),
  accountDiscover: route("/account/discover"),
  beforeYouContinue: route("/before-you-continue"),
  collectionNfts: route(
    (contractAddress: string, returnTo?: string) =>
      returnTo
        ? `/account/collection/${contractAddress}?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/account/collection/${contractAddress}`,
    `/account/collection/:contractAddress`,
  ),
  accountNft: route(
    (contractAddress: string, tokenId: string, returnTo?: string) =>
      returnTo
        ? `/account/nfts/${contractAddress}/${tokenId}?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/account/nfts/${contractAddress}/${tokenId}`,
    `/account/nfts/:contractAddress/:tokenId`,
  ),
  accountHideOrDeleteConfirm: route(
    (accountId: AccountId, mode: "hide" | "remove" | "delete") =>
      `/account/hide-or-remove-confirm/${accountId}/${mode}`,
    `/account/hide-or-remove-confirm/:accountId/:mode`,
  ),
  sendRecipientScreen: route(
    (query: SendQuery) => `/send?${qs(query)}`,
    "/send",
  ),
  sendAddressBookEdit: route(
    (contact?: AddressBookContact) => `/send/address-book/edit?${qs(contact)}`,
    "/send/address-book/edit",
  ),
  sendAmountAndAssetScreen: route(
    (query: SendQuery) => `/send/amount-and-asset/?${qs(query)}`,
    "/send/amount-and-asset",
  ),
  sendAssetScreen: route(
    (query: SendQuery) => `/send/asset/?${qs(query)}`,
    "/send/asset",
  ),
  sendCollectionsNftsScreen: route(
    (query: SendQuery) => `/send/collections-nfts/?${qs(query)}`,
    "/send/collections-nfts",
  ),
  transactionDetail: route(
    (txHash: string, returnTo?: string) =>
      returnTo
        ? `/account/activity/${txHash}?returnTo=${encodeURIComponent(returnTo)}`
        : `/account/activity/${txHash}`,
    `/account/activity/:txHash`,
  ),
  accountDeprecated: route("/account/account-deprecated"),
  accountOwnerWarning: routeWithReturnTo("/account/account-owner-warning"),
  accountsHidden: route(
    (networkId: string, returnTo?: string) =>
      returnTo
        ? `/accounts/hidden/${networkId}?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/accounts/hidden/${networkId}`,
    "/accounts/hidden/:networkId",
  ),
  accounts: routeWithReturnTo("/accounts"),
  newAccount: route(
    (networkId: string, returnTo?: string) =>
      returnTo
        ? `/accounts/new/${networkId}?returnTo=${encodeURIComponent(returnTo)}`
        : `/accounts/new/${networkId}`,
    "/accounts/new/:networkId",
  ),
  changeAccountImplementations: route(
    (accountId) => `/accounts/${accountId}/change-implementation`,
    "/accounts/:accountId/change-implementation",
  ),
  accountImplementation: route(
    (accountId) => `/accounts/${accountId}/implementation`,
    "/accounts/:accountId/implementation",
  ),
  addAccount: route("/accounts/new"),
  standardAccountSignerSelection: route("/account/standard/signer-selection"),
  smartAccountStart: route(
    (accountId) => `/accounts/${accountId}/smartAccount`,
    "/accounts/:accountId/smartAccount",
  ),
  argentAccountEmail: route(
    (accountId, flow: Flow, returnTo?: string) =>
      returnTo
        ? `/accounts/${accountId}/${flow}/email?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/accounts/${accountId}/${flow}/email`,
    "/accounts/:accountId/:flow/email",
  ),
  argentAccountLoggedIn: route(
    (accountId) => `/accounts/${accountId}/logged-in`,
    "/accounts/:accountId/logged-in",
  ),
  smartAccountOTP: route(
    (accountId: AccountId, email: string, flow: Flow) =>
      `/accounts/${accountId}/${flow}/otp?email=${encodeURIComponent(email)}`,
    "/accounts/:accountId/:flow/otp",
  ),
  createSmartAccountOTP: route(
    (email: string, flow: Flow) =>
      `/accounts/${flow}/otp?email=${encodeURIComponent(email)}`,
    "/accounts/:flow/otp",
  ),
  createSmartAccountEmail: route(
    (returnTo?: string) =>
      returnTo
        ? `/accounts/email?returnTo=${encodeURIComponent(returnTo)}`
        : `/accounts/email`,
    "/accounts/email",
  ),
  smartAccountAction: route(
    (accountId) => `/accounts/${accountId}/smartAccount/action`,
    "/accounts/:accountId/smartAccount/action",
  ),
  smartAccountFinish: route(
    (accountId) => `/accounts/${accountId}/smartAccount/finish`,
    "/accounts/:accountId/smartAccount/finish",
  ),
  smartAccountEscapeWarning: route(
    (accountId) => `/accounts/${accountId}/smartAccount/escape-warning`,
    "/accounts/:accountId/smartAccount/escape-warning",
  ),
  newToken: route("/tokens/new"),
  funding: route("/funding"),
  fundingBridge: route("/funding/bridge"),
  exportPrivateKey: route(
    (accountId, type) => `/export-private-key/${accountId}/${type}`,
    "/export-private-key/:accountId/:type",
  ),
  exportPublicKey: route(
    (accountId) => `/export-public-key/${accountId}`,
    "/export-public-key/:accountId",
  ),
  fundingQrCode: route("/funding/qr-code"),
  fundingProvider: route(
    (tokenAddress?: string, returnTo?: string) =>
      returnTo
        ? `/funding/provider/${tokenAddress}?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/funding/provider/${tokenAddress}`,
    "/funding/provider/:tokenAddress?",
  ),
  fundingFaucetFallback: route("/funding/faucet-fallback"),
  fundingFaucetSepolia: route("/funding/faucet-sepolia"),
  hideToken: route(
    (tokenAddress: string) => `/tokens/${tokenAddress}/hide`,
    "/tokens/:tokenAddress/hide",
  ),
  addPlugin: route(
    (accountId) => `/add-plugin/${accountId}`,
    "/add-plugin/:accountId",
  ),
  reset: route("/reset"),
  legacy: route("/legacy"),
  settings: routeWithReturnTo("/settings"),
  settingsAccount: route(
    (accountId: AccountId, returnTo?: string) =>
      returnTo
        ? `/settings/account/${accountId}?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/settings/account/${accountId}`,
    "/settings/account/:accountId",
  ),
  settingsPreferences: routeWithReturnTo("/settings/preferences"),
  settingsBlockExplorer: routeWithReturnTo(
    "/settings/preferences/block-explorer",
  ),
  settingsNftMarketplace: routeWithReturnTo(
    "/settings/preferences/nft-marketplace",
  ),
  settingsIdProvider: routeWithReturnTo("/settings/preferences/id-provider"),
  settingsHiddenAndSpamTokens: routeWithReturnTo(
    "/settings/preferences/hidden-and-spam-tokens",
  ),
  settingsNetworks: route("/settings/advanced/networks"),
  settingsSeed: routeWithReturnTo("/settings/seed"),
  settingsAutoLockTimer: routeWithReturnTo("/settings/auto-lock-timer"),
  settingsAddCustomNetwork: route("/settings/advanced/networks/add"),
  settingsEditCustomNetwork: route(
    (networkId) => `/settings/advanced/networks/${networkId}/edit`,
    "/settings/advanced/networks/:networkId/edit",
  ),
  settingsRemoveCustomNetwork: route("/settings/advanced/networks/remove"),
  settingsAuthorizedDappsAccountList: route("/settings/dapp-connections"),
  settingsAuthorizedDappsAccount: route(
    (accountId) => `/settings/dapp-connections/${accountId}`,
    "/settings/dapp-connections/:accountId",
  ),
  settingsSecurityAndRecovery: routeWithReturnTo(
    "/settings/security-and-recovery",
  ),
  settingsPrivacy: routeWithReturnTo("/settings/privacy"),
  settingsAdvanced: route("/settings/advanced"),
  settingsExperimental: route("/settings/advanced/experimental"),
  settingsBetaFeatures: route("/settings/advanced/beta-features"),
  settingsAddressBook: route("/settings/addressbook"),
  settingsSecurityPeriod: route(`/settings/security-period`),
  settingsRemoveGuardian: route(`/settings/remove-guardian`),
  settingsAddressBookAddOrEdit: route(
    (contact?: AddressBookContact) =>
      `/settings/addressbook/add-or-edit?${qs(contact)}`,
    "/settings/addressbook/add-or-edit",
  ),
  settingsClearLocalStorage: route("/settings/clear-local-storage"),
  settingsDownloadLogs: route("/settings/download-logs"),
  deploymentData: route("/settings/deployment-data"),
  networkWarning: routeWithReturnTo("/network-warning"),
  backupDownload: route(
    (isFromSettings?: boolean) =>
      `/backup-download${isFromSettings ? "?settings" : ""}`,
    "/backup-download",
  ),
  userReview: route("/user-review"),
  userReviewFeedback: route("/user-review/feedback"),
  backgroundError: route("/background-error"),
  error: route("/error"),
  ledgerConnect: route(
    (
      accountType: CreateAccountType,
      networkId: string,
      ctx: LedgerStartContext,
      signerToReplace?: string,
    ) =>
      `/ledger/connect/${accountType}/${networkId}/${ctx}/${signerToReplace}`,
    "/ledger/connect/:accountType/:networkId/:ctx/:signerToReplace",
  ),
  ledgerSelect: route("/ledger/select"),
  ledgerDone: route("/ledger/done"),

  /** Multisig Routes **/
  multisigNew: route("/account/new/multisig"),
  multisigSetup: route("/multisig/setup"),
  multisigSignerSelection: route(
    (ctx: "create" | "join" | "replace", signerToReplace?: string) =>
      `/multisig/signer-selection/${ctx}/${signerToReplace}`,
    "/multisig/signer-selection/:ctx/:signerToReplace",
  ),
  multisigCreate: route(
    (networkId: string, creatorType: SignerType) =>
      `/multisig/create/${networkId}/${creatorType}`,
    "/multisig/create/:networkId/:creatorType",
  ),
  multisigJoin: route(
    (publicKey: string) => `/multisig/join/${publicKey}`,
    "/multisig/join/:publicKey",
  ),
  multisigJoinSettings: route(
    (publicKey: string, returnTo?: string) =>
      returnTo
        ? `/multisig/join/${publicKey}/settings?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/multisig/join/${publicKey}/settings`,
    "/multisig/join/:publicKey/settings",
  ),
  multisigOwners: route(
    (accountId) => `/multisig/${accountId}/owners`,
    "/multisig/:accountId/owners",
  ),
  multisigConfirmations: route(
    (accountId) => `/multisig/${accountId}/confirmations`,
    "/multisig/:accountId/confirmations",
  ),
  multisigAddOwners: route(
    (accountId) => `/multisig/${accountId}/add-owners`,
    "/multisig/:accountId/add-owners",
  ),
  multisigRemoveOwners: route(
    (accountId, signerToRemove) =>
      `/multisig/${accountId}/${signerToRemove}/remove-owners`,
    "/multisig/:accountId/:signerToRemove/remove-owners",
  ),
  multisigReplaceOwner: route(
    (accountId, signerToReplace) =>
      `/multisig/${accountId}/${signerToReplace}/replace-owner`,
    "/multisig/:accountId/:signerToReplace/replace-owner",
  ),
  multisigPendingTransactionDetails: route(
    (accountId, requestId, returnTo?: string) =>
      returnTo
        ? `/multisig/transactions/${accountId}/${requestId}/details?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/multisig/transactions/${accountId}/${requestId}/details`,
    "/multisig/transactions/:accountId/:requestId/details",
  ),
  multisigTransactionConfirmations: route(
    (accountId, requestId, transactionType: "pending" | "activity") =>
      `/multisig/${accountId}/${requestId}/${transactionType}/confirmations`,
    "/multisig/:accountId/:requestId/:transactionType/confirmations",
  ),
  multisigRemovedSettings: route(
    (accountId: AccountId, returnTo?: string) =>
      returnTo
        ? `/multisig/removed/${accountId}/settings?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/multisig/removed/${accountId}/settings`,
    "/multisig/removed/:accountId/settings",
  ),

  multisigPendingOffchainSignatureDetails: route(
    (accountId, requestId) =>
      `/multisig/signatures/${accountId}/${requestId}/details`,
    "/multisig/signatures/:accountId/:requestId/details",
  ),

  tokenDetails: route(
    (address, networkId, returnTo = routes.accountTokens()) =>
      `/token/${address}/${networkId}?returnTo=${encodeURIComponent(returnTo)}`,
    "/token/:address/:networkId",
  ),

  multisigPendingOffchainSignatureConfirmations: route(
    (accountId, requestId) =>
      `/multisig/signatures/${accountId}/${requestId}/confirmations`,
    "/multisig/signatures/:accountId/:requestId/confirmations",
  ),

  multisigOffchainSignatureWarning: route("/multisig/signatures/warning"),

  airGapReview: route((data) => `/airgap/${data}`, "/airgap/:data"),

  privateKeyImport: routeWithReturnTo("/account/pk-import"),
  swapToken: route(
    (tokenAddress?: string, returnTo?: string) =>
      returnTo
        ? `/swap${tokenAddress ? `/${tokenAddress}` : ""}?returnTo=${encodeURIComponent(returnTo)}`
        : `/swap${tokenAddress ? `/${tokenAddress}` : ""}`,
    "/swap/:tokenAddress?",
  ),
  swapSettings: routeWithReturnTo("/swap-settings"),

  // Staking
  staking: routeWithReturnTo("/staking"),
  nativeStakingIndex: routeWithReturnTo("/staking/native"), // allows router to resolve without investmentId
  nativeStaking: route(
    (investmentId?: string, returnTo?: string) =>
      returnTo
        ? `/staking/native${investmentId ? `/${investmentId}` : ""}?returnTo=${encodeURIComponent(returnTo)}`
        : `/staking/native${investmentId ? `/${investmentId}` : ""}`,
    "/staking/native/:investmentId?",
  ),
  nativeStakingSelect: routeWithReturnTo("/staking/native-select"),
  liquidStakingIndex: routeWithReturnTo("/staking/liquid"), // allows router to resolve without investmentId
  liquidStaking: route(
    (investmentId?: string, returnTo?: string) =>
      returnTo
        ? `/staking/liquid${investmentId ? `/${investmentId}` : ""}?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/staking/liquid${investmentId ? `/${investmentId}` : ""}`,
    "/staking/liquid/:investmentId?",
  ),
  liquidStakingSelect: routeWithReturnTo("/staking/liquid-select"),
  nativeUnstake: route(
    (investmentPositionId: string, returnTo?: string) =>
      returnTo
        ? `/staking/unstake-native/${investmentPositionId}?returnTo=${encodeURIComponent(returnTo)}`
        : `/staking/unstake-native/${investmentPositionId}`,
    "/staking/unstake-native/:investmentPositionId",
  ),
  liquidUnstake: route(
    (investmentPositionId: string, returnTo?: string) =>
      returnTo
        ? `/staking/unstake-liquid/${investmentPositionId}?returnTo=${encodeURIComponent(returnTo)}`
        : `/staking/unstake-liquid/${investmentPositionId}`,
    "/staking/unstake-liquid/:investmentPositionId",
  ),

  // Defi
  defiPositionDetails: route(
    (positionId: string, dappId: string, returnTo?: string) =>
      returnTo
        ? `/defi/position/${positionId}/${dappId}?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/defi/position/${positionId}/${dappId}`,
    "/defi/position/:positionId/:dappId",
  ),

  // Account Labels
  editAccountLabel: route(
    (accountId: AccountId) => `/account-labels/edit/${accountId}`,
    "/account-labels/edit/:accountId",
  ),
}
