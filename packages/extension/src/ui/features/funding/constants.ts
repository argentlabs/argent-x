import {
  ETH_TOKEN_ADDRESS,
  STRK_TOKEN_ADDRESS,
  USDC_TOKEN_ADDRESS,
} from "../../../shared/network/constants"

import type { Address } from "@argent/x-shared"

export const TOKENS_WITH_ON_RAMP = [
  USDC_TOKEN_ADDRESS,
  STRK_TOKEN_ADDRESS,
  ETH_TOKEN_ADDRESS,
]

export const PROVIDER_TOKENS: Record<string, Address[]> = {
  banxa: [ETH_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS],
  ramp: [ETH_TOKEN_ADDRESS],
  topper: [ETH_TOKEN_ADDRESS, STRK_TOKEN_ADDRESS],
}
