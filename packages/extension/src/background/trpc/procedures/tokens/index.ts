import { router } from "../../trpc"
import { addTokenProcedure } from "./addToken"
import { fetchTokenBalanceProcedure } from "./fetchAccountBalance"
import { fetchCurrencyBalanceForAccountsFromBackendProcedure } from "./fetchTokenBalancesForAccountsFromBackend"
import { fetchDetailsProcedure } from "./fetchDetails"
import { getAccountBalanceProcedure } from "./getAccountBalance"
import { getAllTokenBalancesProcedure } from "./getAllTokenBalances"
import { getTokenBalanceProcedure } from "./getTokenBalance"
import { getCurrencyValueForTokensProcedure } from "./getCurrencyValueForTokens"
import { removeTokenProcedure } from "./removeToken"
import { fetchTokenGraphProcedure } from "./fetchTokenGraph"
import { toggleHideTokenProcedure } from "./hideTokenProcedure"
import { fetchTokenActivitiesProcedure } from "./fetchTokenActivities"
import { reportSpamTokenProcedure } from "./reportSpamToken"

export const tokensRouter = router({
  addToken: addTokenProcedure,
  removeToken: removeTokenProcedure,
  toggleHideToken: toggleHideTokenProcedure,
  reportSpamToken: reportSpamTokenProcedure,
  fetchDetails: fetchDetailsProcedure,
  fetchTokenBalance: fetchTokenBalanceProcedure,
  getAccountBalance: getAccountBalanceProcedure,
  getAllTokenBalances: getAllTokenBalancesProcedure,
  getTokenBalance: getTokenBalanceProcedure,
  getCurrencyValueForTokens: getCurrencyValueForTokensProcedure,
  fetchCurrencyBalanceForAccountsFromBackend:
    fetchCurrencyBalanceForAccountsFromBackendProcedure,
  fetchTokenGraph: fetchTokenGraphProcedure,
  fetchTokenActivities: fetchTokenActivitiesProcedure,
})
