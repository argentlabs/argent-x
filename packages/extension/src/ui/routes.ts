import { isString } from "lodash-es"

const route = <T extends (..._: any[]) => string>(
  ...[value, path]: [routeAndPath: string] | [routeWithParams: T, path: string]
): T & { path: string } => {
  if (isString(value)) {
    return Object.defineProperty((() => value) as any, "path", { value })
  }
  return Object.defineProperty(value as any, "path", { value: path })
}

export const routes = {
  welcome: route("/index.html"),
  newWallet: route("/wallets/new"),
  backupRecovery: route("/recover/backup"),
  seedRecovery: route("/recover/seed"),
  seedRecoveryPassword: route("/recover/seed/password"),
  setupRecovery: route("/recovery"),
  setupSeedRecovery: route("/recovery/seed"),
  confirmSeedRecovery: route("/recovery/seed/confirm"),
  lockScreen: route("/lock-screen"),
  accountTokens: route("/account/tokens"),
  accountNfts: route("/account/nfts"),
  accountActivity: route("/account/activity"),
  accountNft: route(
    (contractAddress: string, tokenId: string) =>
      `/account/nfts/${contractAddress}/${tokenId}`,
    `/account/nfts/:contractAddress/:tokenId`,
  ),
  accountHideConfirm: route(
    (accountAddress) => `/account/hide-confirm/${accountAddress}`,
    `/account/hide-confirm/:accountAddress`,
  ),
  accountDeleteConfirm: route(
    (accountAddress) => `/account/delete-confirm/${accountAddress}`,
    `/account/delete-confirm/:accountAddress`,
  ),
  transactionDetail: route(
    (txHash: string) => `/account/activity/transaction-detail/${txHash}`,
    `/account/activity/transaction-detail/:txHash`,
  ),
  upgrade: route("/account/upgrade"),
  accounts: route("/accounts"),
  newToken: route("/tokens/new"),
  funding: route("/funding"),
  exportPrivateKey: route("/export-private-key"),
  fundingQrCode: route("/funding/qr-code"),
  token: route(
    (tokenAddress: string) => `/tokens/${tokenAddress}`,
    "/tokens/:tokenAddress",
  ),
  hideToken: route(
    (tokenAddress: string) => `/tokens/${tokenAddress}/hide`,
    "/tokens/:tokenAddress/hide",
  ),
  reset: route("/reset"),
  disclaimer: route("/disclaimer"),
  migrationDisclaimer: route("/migration-disclaimer"),
  legacy: route("/legacy"),
  settings: route("/settings"),
  settingsNetworks: route("/settings/networks"),
  settingsSeed: route("/settings/seed"),
  settingsAddCustomNetwork: route("/settings/networks/add"),
  settingsEditCustomNetwork: route("/settings/networks/edit"),
  settingsRemoveCustomNetwork: route("/settings/networks/remove"),
  settingsDappConnections: route("/settings/dapp-connections"),
  networkWarning: route("/network-warning"),
  backupDownload: route(
    (isFromSettings?: boolean) =>
      `/backup-download${isFromSettings ? "?settings" : ""}`,
    "/backup-download",
  ),
  error: route("/error"),
}
