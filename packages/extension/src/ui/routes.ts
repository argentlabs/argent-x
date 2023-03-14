import { isString } from "lodash-es"
import { useMemo } from "react"
import { useLocation, useParams } from "react-router-dom"

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

/** hook that builds on useLocation to parse query string */

export const useQuery = () => {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

/** hook to get the `returnTo` query parameter */

export const useReturnTo = () => {
  /** get() returns null for missing value, cleaner to return undefined */
  return useQuery().get("returnTo") || undefined
}

export const useRouteAccountAddress = () => {
  const { accountAddress } = useParams()
  return accountAddress
}

export const useRouteEmailAddress = () => {
  return useQuery().get("email") || undefined
}

/** makes a returnTo parameter that captures current page location including query */
export const useCurrentPathnameWithQuery = () => {
  const location = useLocation()
  return `${location.pathname}${location.search}`
}

export const routes = {
  onboardingStart: route("/index.html"),
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
  sendScreen: route("/send"),
  sendToken: route(
    (tokenAddress: string, returnTo?: string) =>
      returnTo
        ? `/send-token/${tokenAddress}?returnTo=${encodeURIComponent(returnTo)}`
        : `/send-token/${tokenAddress}`,
    "/send-token/:tokenAddress",
  ),
  sendNft: route(
    (contractAddress: string, tokenId: string) =>
      `/account/send-nft/${contractAddress}/${tokenId}`,
    `/account/send-nft/:contractAddress/:tokenId`,
  ),
  transactionDetail: route(
    (txHash: string) => `/account/activity/transaction-detail/${txHash}`,
    `/account/activity/transaction-detail/:txHash`,
  ),
  upgrade: route("/account/upgrade"),
  networkUpgradeV4: route("/account/network-upgradeV4"),
  accountUpgradeV4: route("/account/account-upgradeV4"),
  accountsHidden: route(
    (networkId: string) => `/accounts/hidden/${networkId}`,
    "/accounts/hidden/:networkId",
  ),
  accounts: routeWithReturnTo("/accounts"),
  newAccount: route("/account/new"),
  editAccount: route(
    (accountAddress, returnTo?: string) =>
      returnTo
        ? `/accounts/${accountAddress}?returnTo=${encodeURIComponent(returnTo)}`
        : `/accounts/${accountAddress}`,
    "/accounts/:accountAddress",
  ),
  accountImplementations: route(
    (accountAddress) => `/accounts/${accountAddress}/implementation`,
    "/accounts/:accountAddress/implementation",
  ),
  addAccount: route("/accounts/new"),
  shieldAccountStart: route(
    (accountAddress) => `/accounts/${accountAddress}/shield`,
    "/accounts/:accountAddress/shield",
  ),
  shieldAccountEmail: route(
    (accountAddress) => `/accounts/${accountAddress}/shield/email`,
    "/accounts/:accountAddress/shield/email",
  ),
  shieldAccountOTP: route(
    (accountAddress, email) =>
      `/accounts/${accountAddress}/shield/otp?email=${encodeURIComponent(
        email,
      )}`,
    "/accounts/:accountAddress/shield/otp",
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
  exportPrivateKey: route("/export-private-key"),
  fundingQrCode: route("/funding/qr-code"),
  fundingProvider: route("/funding/provider"),
  token: route(
    (tokenAddress: string) => `/tokens/${tokenAddress}`,
    "/tokens/:tokenAddress",
  ),
  hideToken: route(
    (tokenAddress: string) => `/tokens/${tokenAddress}/hide`,
    "/tokens/:tokenAddress/hide",
  ),
  addPlugin: route(
    (accountAddress) => `/add-plugin/${accountAddress}`,
    "/add-plugin/:accountAddress",
  ),
  reset: route("/reset"),
  migrationDisclaimer: route("/migration-disclaimer"),
  legacy: route("/legacy"),
  settings: routeWithReturnTo("/settings"),
  settingsNetworks: route("/settings/developer-settings/networks"),
  settingsSeed: routeWithReturnTo("/settings/seed"),
  settingsAddCustomNetwork: route("/settings/developer-settings/networks/add"),
  settingsEditCustomNetwork: route(
    "/settings/developer-settings/networks/edit",
  ),
  settingsRemoveCustomNetwork: route(
    "/settings/developer-settings/networks/remove",
  ),
  settingsDappConnections: route("/settings/dapp-connections"),
  settingsPrivacy: route("/settings/privacy"),
  settingsDeveloper: route("/settings/developer-settings"),
  settingsExperimental: route("/settings/developer-settings/experimental"),
  settingsBlockExplorer: route("/settings/developer-settings/block-explorer"),
  settingsAddressbook: route("/settings/addressbook"),
  settingsAddressbookEdit: route(
    (contactId) => `/settings/addressbook/add-or-edit/${contactId}`,
    "/settings/addressbook/add-or-edit/:contactId",
  ),
  settingsAddressbookAdd: route("/settings/addressbook/add-or-edit"),
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

  multisigNew: route("/account/new/multisig"),
  multisigSetup: route("/multisig/setup"),
  multisigCreate: route(
    (networkId) => `/multisig/create/${networkId}`,
    "/multisig/create/:networkId",
  ),
  multisigJoin: route("/multisig/join"),
  swap: route("/swap"),
}
