import type { IRepository } from "../storage/__new/interface"
import { accountsEqualByAddress } from "../utils/accountsEqual"
import type { IKeyValueStorage } from "../storage"
import { KeyValueStorage } from "../storage"
import type { AccountInvestmentsWithUsdValue } from "./types"
import type { ParsedPositionWithUsdValueAndTitleAndLiquidityTokens } from "../defiDecomposition/schema"
import { ChromeRepository } from "../storage/__new/chrome"
import { browserStorage } from "../storage/browser"

export const investmentRepo: IInvestmentsRepository =
  new ChromeRepository<AccountInvestmentsWithUsdValue>(browserStorage, {
    areaName: "local",
    namespace: "core:investments",
    compare: (a, b) => accountsEqualByAddress(a, b),
  })

export const investmentByPositionIdRepo: IInvestmentsByPositionIdRepository =
  new KeyValueStorage<AccountInvestmentsByPositionId>(
    {},
    {
      namespace: "core:investments:byPositionId",
    },
  )

interface AccountInvestmentsByPositionId {
  [positionId: string]: ParsedPositionWithUsdValueAndTitleAndLiquidityTokens
}

export type IInvestmentsRepository = IRepository<AccountInvestmentsWithUsdValue>
export type IInvestmentsByPositionIdRepository =
  IKeyValueStorage<AccountInvestmentsByPositionId>
