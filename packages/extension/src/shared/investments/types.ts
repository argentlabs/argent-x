import type { Address } from "@argent/x-shared"
import type {
  ParsedDefiDecomposition,
  ParsedDefiDecompositionWithUsdValue,
} from "../defiDecomposition/schema"
import type { BaseTokenWithBalance } from "../token/__new/types/tokenBalance.model"
import type { BaseToken } from "../token/__new/types/token.model"

export type AccountInvestments = {
  address: Address
  networkId: string
  defiDecomposition: ParsedDefiDecomposition
}

export type AccountInvestmentsWithUsdValue = {
  address: Address
  networkId: string
  defiDecomposition: ParsedDefiDecompositionWithUsdValue
  tokenBalances: BaseTokenWithBalance[]
  liquidityTokens: BaseToken[]
}

export type AccountInvestmentsKey = [Address, string]
