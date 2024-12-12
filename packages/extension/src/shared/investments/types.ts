import type { Address } from "@argent/x-shared"
import type { ParsedDefiDecomposition } from "../defiDecomposition/schema"

export type AccountInvestments = {
  address: Address
  networkId: string
  defiDecomposition: ParsedDefiDecomposition
}

export type AccountInvestmentsKey = [Address, string]
