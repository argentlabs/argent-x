import { isNil, isString, omitBy } from "lodash-es"
import { useLocation, useParams } from "react-router-dom"

import { AddressBookContact } from "../shared/addressBook/type"
import {
  Flow,
  flowSchema,
} from "./features/argentAccount/argentAccountBaseEmailScreen.model"
import { SendQuery } from "./features/send/schema"
import { useQuery } from "./hooks/useQuery"

const route = <T extends (..._: any[]) => string>(
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

/** TODO: refactor: move hooks into /hooks folder in individual files */

/** hook to get the `returnTo` query parameter */

export const useReturnTo = () => {
  /** get() returns null for missing value, cleaner to return undefined */
  return useQuery().get("returnTo") || undefined
}

export const useRouteAccountAddress = () => {
  const { accountAddress } = useParams()
  return accountAddress
}

export const useRouteFlow = () => {
  const { flow } = useParams()
  return flowSchema.parse(flow)
}

export const useRouteRequestId = () => {
  const { requestId } = useParams()
  return requestId
}

export const useRouteSignerToRemove = () => {
  const { signerToRemove } = useParams()
  return signerToRemove
}

export const useRouteSignerToReplace = () => {
  const { signerToReplace } = useParams()
  return signerToReplace
}

export const useRouteEmailAddress = () => {
  return useQuery().get("email") || undefined
}

/** makes a returnTo parameter that captures current page location including query */
export const useCurrentPathnameWithQuery = () => {
  const location = useLocation()
  return `${location.pathname}${location.search}`
}

/** like URLSearchParams.toString() but omits undefined, null */
export const qs = (query?: Record<string, string>) => {
  const cleanedQuery = omitBy(query, isNil)
  return new URLSearchParams(cleanedQuery).toString()
}

export const routes = {
  onboardingStart: route("/onboarding/start"),
  onboardingDisclaimer: route("/onboarding/disclaimer"),
  onboardingPrivacyStatement: route("/onboarding/privacy"),
  onboardingPassword: route("/onboarding/password"),
  onboardingFinish: route("/onboarding/finish"),
  onboardingRestoreBackup: route("/onboarding/restore/backup"),
  onboardingRestoreSeed: route("/onboarding/restore/seed"),
  onboardingRestorePassword: route("/onboarding/restore/password"),
  setupRecovery: routeWithReturnTo("/recovery"),
  setupSeedRecovery: routeWithReturnTo("/recovery/seed"),
  confirmSeedRecovery: routeWithReturnTo("/recovery/seed/confirm"),
  lockScreen: route("/lock-screen"),
  accountTokens: route("/account/tokens"),
  accountCollections: route("/account/collections"),
  accountActivity: route("/account/activity"),
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
    (txHash: string) => `/account/activity/transaction-detail/${txHash}`,
    `/account/activity/transaction-detail/:txHash`,
  ),
  accountDeprecated: route("/account/account-deprecated"),
  accountsHidden: route(
    (networkId: string) => `/accounts/hidden/${networkId}`,
    "/accounts/hidden/:networkId",
  ),
  accounts: routeWithReturnTo("/accounts"),
  newAccount: routeWithReturnTo("/accounts/new"),
  editAccount: route(
    (accountAddress, returnTo?: string) =>
      returnTo
        ? `/accounts/${accountAddress}?returnTo=${encodeURIComponent(returnTo)}`
        : `/accounts/${accountAddress}`,
    "/accounts/:accountAddress",
  ),
  changeAccountImplementations: route(
    (accountAddress) => `/accounts/${accountAddress}/change-implementation`,
    "/accounts/:accountAddress/change-implementation",
  ),
  accountImplementation: route(
    (accountAddress) => `/accounts/${accountAddress}/implementation`,
    "/accounts/:accountAddress/implementation",
  ),
  addAccount: route("/accounts/new"),
  shieldAccountStart: route(
    (accountAddress) => `/accounts/${accountAddress}/shield`,
    "/accounts/:accountAddress/shield",
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
  argentAccountEmailPreferences: routeWithReturnTo(
    "/settings/email-preferences",
  ),
  shieldAccountOTP: route(
    (accountAddress: string, email: string, flow: Flow) =>
      `/accounts/${accountAddress}/${flow}/otp?email=${encodeURIComponent(
        email,
      )}`,
    "/accounts/:accountAddress/:flow/otp",
  ),
  shieldAccountAction: route(
    (accountAddress) => `/accounts/${accountAddress}/shield/action`,
    "/accounts/:accountAddress/shield/action",
  ),
  shieldAccountFinish: route(
    (accountAddress) => `/accounts/${accountAddress}/shield/finish`,
    "/accounts/:accountAddress/shield/finish",
  ),
  shieldEscapeWarning: route(
    (accountAddress) => `/accounts/${accountAddress}/shield/escape-warning`,
    "/accounts/:accountAddress/shield/escape-warning",
  ),
  newToken: route("/tokens/new"),
  funding: route("/funding"),
  fundingBridge: route("/funding/bridge"),
  exportPrivateKey: route(
    (accountAddress) => `/export-private-key/${accountAddress}`,
    "/export-private-key/:accountAddress",
  ),
  fundingQrCode: route("/funding/qr-code"),
  fundingProvider: route("/funding/provider"),
  fundingFaucetFallback: route("/funding/faucet-fallback"),
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
  settingsNetworks: route("/settings/developer-settings/networks"),
  settingsSeed: routeWithReturnTo("/settings/seed"),
  settingsAddCustomNetwork: route("/settings/developer-settings/networks/add"),
  settingsEditCustomNetwork: route(
    (networkId) => `/settings/developer-settings/networks/${networkId}/edit`,
    "/settings/developer-settings/networks/:networkId/edit",
  ),
  settingsRemoveCustomNetwork: route(
    "/settings/developer-settings/networks/remove",
  ),
  settingsDappConnections: route("/settings/dapp-connections"),
  settingsPrivacy: route("/settings/privacy"),
  settingsDeveloper: route("/settings/developer-settings"),
  settingsExperimental: route("/settings/developer-settings/experimental"),
  settingsBetaFeatures: route("/settings/developer-settings/beta-features"),
  settingsBlockExplorer: route("/settings/developer-settings/block-explorer"),
  settingsAddressBook: route("/settings/addressbook"),
  settingsAddressBookAddOrEdit: route(
    (contact?: AddressBookContact) =>
      `/settings/addressbook/add-or-edit?${qs(contact)}`,
    "/settings/addressbook/add-or-edit",
  ),
  settingsPrivacyStatement: route("/settings/privacy-policy"),
  settingsSmartContractDevelopment: route(
    "/settings/smart-contract-development",
  ),
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
  error: route("/error"),
  ledgerEntry: route("/ledger/start"),
  ledgerSelect: route("/ledger/select"),
  ledgerDone: route("/ledger/done"),

  /** Multisig Routes **/
  multisigNew: route("/account/new/multisig"),
  multisigSetup: route("/multisig/setup"),
  multisigCreate: route(
    (networkId: string) => `/multisig/create/${networkId}`,
    "/multisig/create/:networkId",
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
    (accountAddress, requestId) =>
      `/multisig/${accountAddress}/${requestId}/details`,
    "/multisig/:accountAddress/:requestId/details",
  ),
  multisigPendingTransactionConfirmations: route(
    (accountAddress, requestId) =>
      `/multisig/${accountAddress}/${requestId}/confirmations`,
    "/multisig/:accountAddress/:requestId/confirmations",
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

  swap: route("/swap"),
}
