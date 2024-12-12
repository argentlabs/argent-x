import type { Address } from "@argent/x-shared"
import { z } from "zod"

export const apiTokenGraphDataSchema = z.object({
  info: z.object({
    currency: z.string(),
    timeframe: z.string(),
    timeIntervals: z.number(),
  }),
  prices: z.array(
    z.object({
      date: z.number(),
      ethValue: z.number().optional(),
      ccyValue: z.number().optional(),
    }),
  ),
})

export type TokenGraphInput = {
  tokenAddress: Address
  currency: string
  timeFrame: string
  chain: string
}
export type TokenGraphDataApi = z.infer<typeof apiTokenGraphDataSchema>

/**
 * ITokenService interface provides methods for managing tokens, including storage methods, fetch methods, and get methods.
 */
export interface ITokensDetailsService {
  /**
   * Fetch methods - These methods fetch data from backend or chain
   * fetchTokenGraph: Fetch graph data for a token
   */
  fetchTokenGraph: (
    input: TokenGraphInput,
  ) => Promise<TokenGraphDataApi | undefined>
}
