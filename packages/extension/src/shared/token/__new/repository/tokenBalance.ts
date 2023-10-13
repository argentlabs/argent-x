import browser from "webextension-polyfill"
import { ChromeRepository } from "../../../storage/__new/chrome"
import { IRepository } from "../../../storage/__new/interface"
import { equalToken } from "../utils"
import { BaseTokenWithBalance } from "../types/tokenBalance.model"
import { accountsEqual } from "../../../utils/accountsEqual"

export type ITokenBalanceRepository = IRepository<BaseTokenWithBalance>

export const tokenBalanceRepo: ITokenBalanceRepository =
  new ChromeRepository<BaseTokenWithBalance>(browser, {
    areaName: "local",
    namespace: "core:tokenBalances",
    compare: (a: BaseTokenWithBalance, b: BaseTokenWithBalance) =>
      equalToken(a, b) && accountsEqual(a.account, b.account),
  })
