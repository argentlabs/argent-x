import type { Address } from "@argent/x-shared"

import mockTokensWithBalanceRaw from "../../../../test/__fixtures__/tokens-with-balance.mock.json"
import type { TokenWithOptionalBigIntBalance } from "../__new/types/tokenBalance.model"

/** convert to expected types */

export const mockTokensWithBalance: TokenWithOptionalBigIntBalance[] =
  mockTokensWithBalanceRaw.map((token) => {
    return {
      ...token,
      address: token.address as Address,
      decimals: Number(token.decimals),
      balance: BigInt(token.balance),
    }
  })
