export const routes = {
  welcome: "/index.html",
  newAccount: "/accounts/new",
  deployAccount: "/accounts/new/deploy",
  recoverBackup: "/recover",
  password: "/password",
  account: "/account",
  accounts: "/accounts",
  newToken: "/tokens/new",
  token: (id: string) => `/tokens/${id}`,
  reset: "/reset",
  disclaimer: "/disclaimer",
  settings: "/settings",
}
