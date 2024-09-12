import { isNil, isString, omitBy } from "lodash-es"

import type { AddressBookContact } from "../addressBook/type"
import type { Flow } from "../argentAccount/schema"
import type { LedgerStartContext } from "../ledger/schema"
import type { SendQuery } from "../send/schema"
import type { CreateAccountType, SignerType } from "../wallet.model"

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
    (contractAddress: string) => `/account/collection/${contractAddress}`,
    `/account/collection/:contractAddress`,
  ),
  accountNft: route(
    (contractAddress: string, tokenId: string) =>
      `/account/nfts/${contractAddress}/${tokenId}`,
    `/account/nfts/:contractAddress/:tokenId`,
  ),
  accountHideConfirm: route(
    (accountAddress: string) => `/account/hide-confirm/${accountAddress}`,
    `/account/hide-confirm/:accountAddress`,
  ),
  accountDeleteConfirm: route(
    (accountAddress: string) => `/account/delete-confirm/${accountAddress}`,
    `/account/delete-confirm/:accountAddress`,
  ),
  sendRecipientScreen: route(
    (query: SendQuery) => `/send?${qs(query)}`,
    "/send",
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
  newAccount: routeWithReturnTo("/accounts/new"),
  changeAccountImplementations: route(
    (accountAddress) => `/accounts/${accountAddress}/change-implementation`,
    "/accounts/:accountAddress/change-implementation",
  ),
  accountImplementation: route(
    (accountAddress) => `/accounts/${accountAddress}/implementation`,
    "/accounts/:accountAddress/implementation",
  ),
  addAccount: route("/accounts/new"),
  standardAccountSignerSelection: route("/account/standard/signer-selection"),
  smartAccountStart: route(
    (accountAddress) => `/accounts/${accountAddress}/smartAccount`,
    "/accounts/:accountAddress/smartAccount",
  ),
  argentAccountEmail: route(
    (accountAddress, flow: Flow, returnTo?: string) =>
      returnTo
        ? `/accounts/${accountAddress}/${flow}/email?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/accounts/${accountAddress}/${flow}/email`,
    "/accounts/:accountAddress/:flow/email",
  ),
  argentAccountLoggedIn: route(
    (accountAddress) => `/accounts/${accountAddress}/logged-in`,
    "/accounts/:accountAddress/logged-in",
  ),
  smartAccountOTP: route(
    (accountAddress: string, email: string, flow: Flow) =>
      `/accounts/${accountAddress}/${flow}/otp?email=${encodeURIComponent(
        email,
      )}`,
    "/accounts/:accountAddress/:flow/otp",
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
    (accountAddress) => `/accounts/${accountAddress}/smartAccount/action`,
    "/accounts/:accountAddress/smartAccount/action",
  ),
  smartAccountFinish: route(
    (accountAddress) => `/accounts/${accountAddress}/smartAccount/finish`,
    "/accounts/:accountAddress/smartAccount/finish",
  ),
  smartAccountEscapeWarning: route(
    (accountAddress) =>
      `/accounts/${accountAddress}/smartAccount/escape-warning`,
    "/accounts/:accountAddress/smartAccount/escape-warning",
  ),
  newToken: route("/tokens/new"),
  funding: route("/funding"),
  fundingBridge: route("/funding/bridge"),
  exportPrivateKey: route(
    (accountAddress) => `/export-private-key/${accountAddress}`,
    "/export-private-key/:accountAddress",
  ),
  exportPublicKey: route(
    (accountAddress) => `/export-public-key/${accountAddress}`,
    "/export-public-key/:accountAddress",
  ),
  fundingQrCode: route("/funding/qr-code"),
  fundingProvider: route("/funding/provider"),
  fundingFaucetFallback: route("/funding/faucet-fallback"),
  fundingFaucetSepolia: route("/funding/faucet-sepolia"),
  hideToken: route(
    (tokenAddress: string) => `/tokens/${tokenAddress}/hide`,
    "/tokens/:tokenAddress/hide",
  ),
  addPlugin: route(
    (accountAddress) => `/add-plugin/${accountAddress}`,
    "/add-plugin/:accountAddress",
  ),
  reset: route("/reset"),
  legacy: route("/legacy"),
  settings: routeWithReturnTo("/settings"),
  settingsAccount: route(
    (accountAddress, returnTo?: string) =>
      returnTo
        ? `/settings/account/${accountAddress}?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/settings/account/${accountAddress}`,
    "/settings/account/:accountAddress",
  ),
  settingsPreferences: routeWithReturnTo("/settings/preferences"),
  settingsBlockExplorer: routeWithReturnTo(
    "/settings/preferences/block-explorer",
  ),
  settingsNftMarketplace: routeWithReturnTo(
    "/settings/preferences/nft-marketplace",
  ),
  settingsNetworks: route("/settings/developer-settings/networks"),
  settingsSeed: routeWithReturnTo("/settings/seed"),
  settingsAutoLockTimer: routeWithReturnTo("/settings/auto-lock-timer"),
  settingsAddCustomNetwork: route("/settings/developer-settings/networks/add"),
  settingsEditCustomNetwork: route(
    (networkId) => `/settings/developer-settings/networks/${networkId}/edit`,
    "/settings/developer-settings/networks/:networkId/edit",
  ),
  settingsRemoveCustomNetwork: route(
    "/settings/developer-settings/networks/remove",
  ),
  settingsDappConnectionsAccountList: route("/settings/dapp-connections"),
  settingsDappConnectionsAccount: route(
    (accountAddress) => `/settings/dapp-connections/${accountAddress}`,
    "/settings/dapp-connections/:accountAddress",
  ),
  settingsPrivacy: routeWithReturnTo("/settings/privacy"),
  settingsDeveloper: route("/settings/developer-settings"),
  settingsExperimental: route("/settings/developer-settings/experimental"),
  settingsBetaFeatures: route("/settings/developer-settings/beta-features"),
  settingsAddressBook: route("/settings/addressbook"),
  settingsAddressBookAddOrEdit: route(
    (contact?: AddressBookContact) =>
      `/settings/addressbook/add-or-edit?${qs(contact)}`,
    "/settings/addressbook/add-or-edit",
  ),
  settingsSmartContractDevelopment: route(
    "/settings/smart-contract-development",
  ),
  settingsClearLocalStorage: route("/settings/clear-local-storage"),
  settingsDownloadLogs: route("/settings/download-logs"),
  deploymentData: route("/settings/deployment-data"),
  settingsSmartContractDeclare: route(
    "/settings/smart-contract-development/declare",
  ),
  settingsSmartContractDeploy: route(
    "/settings/smart-contract-development/deploy",
  ),
  settingsSmartContractDeclareOrDeploySuccess: route(
    (type: "declare" | "deploy", classHashOrDeployedAddress) =>
      `/settings/smart-contract-development/${type}/success/${classHashOrDeployedAddress}`,
    "/settings/smart-contract-development/:type/success/:classHashOrDeployedAddress",
  ),
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
    ) => `/ledger/connect/${accountType}/${networkId}/${ctx}`,
    "/ledger/connect/:accountType/:networkId/:ctx",
  ),
  ledgerSelect: route("/ledger/select"),
  ledgerDone: route("/ledger/done"),

  /** Multisig Routes **/
  multisigNew: route("/account/new/multisig"),
  multisigSetup: route("/multisig/setup"),
  multisigSignerSelection: route(
    (ctx: "create" | "join") => `/multisig/signer-selection/${ctx}`,
    "/multisig/signer-selection/:ctx",
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
    (accountAddress) => `/multisig/${accountAddress}/owners`,
    "/multisig/:accountAddress/owners",
  ),
  multisigConfirmations: route(
    (accountAddress) => `/multisig/${accountAddress}/confirmations`,
    "/multisig/:accountAddress/confirmations",
  ),
  multisigAddOwners: route(
    (accountAddress) => `/multisig/${accountAddress}/add-owners`,
    "/multisig/:accountAddress/add-owners",
  ),
  multisigRemoveOwners: route(
    (accountAddress, signerToRemove) =>
      `/multisig/${accountAddress}/${signerToRemove}/remove-owners`,
    "/multisig/:accountAddress/:signerToRemove/remove-owners",
  ),
  multisigReplaceOwner: route(
    (accountAddress, signerToReplace) =>
      `/multisig/${accountAddress}/${signerToReplace}/replace-owner`,
    "/multisig/:accountAddress/:signerToReplace/replace-owner",
  ),
  multisigPendingTransactionDetails: route(
    (accountAddress, requestId, returnTo?: string) =>
      returnTo
        ? `/multisig/transactions/${accountAddress}/${requestId}/details?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/multisig/transactions/${accountAddress}/${requestId}/details`,
    "/multisig/transactions/:accountAddress/:requestId/details",
  ),
  multisigTransactionConfirmations: route(
    (accountAddress, requestId, transactionType: "pending" | "activity") =>
      `/multisig/${accountAddress}/${requestId}/${transactionType}/confirmations`,
    "/multisig/:accountAddress/:requestId/:transactionType/confirmations",
  ),
  multisigRemovedSettings: route(
    (accountAddress: string, returnTo?: string) =>
      returnTo
        ? `/multisig/removed/${accountAddress}/settings?returnTo=${encodeURIComponent(
            returnTo,
          )}`
        : `/multisig/removed/${accountAddress}/settings`,
    "/multisig/removed/:accountAddress/settings",
  ),

  multisigPendingOffchainSignatureDetails: route(
    (accountAddress, requestId) =>
      `/multisig/signatures/${accountAddress}/${requestId}/details`,
    "/multisig/signatures/:accountAddress/:requestId/details",
  ),

  multisigPendingOffchainSignatureConfirmations: route(
    (accountAddress, requestId) =>
      `/multisig/signatures/${accountAddress}/${requestId}/confirmations`,
    "/multisig/signatures/:accountAddress/:requestId/confirmations",
  ),

  multisigOffchainSignatureWarning: route("/multisig/signatures/warning"),

  airGapReview: route((data) => `/airgap/${data}`, "/airgap/:data"),

  swap: route("/swap"),
}
