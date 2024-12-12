import type {
  BaseToken,
  Token,
} from "../src/shared/token/__new/types/token.model"
import type { ApiTokensInfoResponse, ApiTokenInfo } from "@argent/x-shared"
import type {
  BaseTokenWithBalance,
  TokenWithBalance,
  TokenWithOptionalBigIntBalance,
} from "../src/shared/token/__new/types/tokenBalance.model"
import type {
  TokenPriceDetails,
  TokenWithPrice,
} from "../src/shared/token/__new/types/tokenPrice.model"
import { getMockWalletAccount } from "./walletAccount.mock"

const defaultBaseToken: BaseToken = {
  address: "0x123",
  networkId: "mainnet-alpha",
}

const defaultToken: Token = {
  ...defaultBaseToken,
  symbol: "TKN",
  name: "Token",
  decimals: 18,
}

const defaultApiTokenDetails: ApiTokenInfo = {
  id: 1,
  address: "0x123",
  name: "Token",
  symbol: "TKN",
  decimals: 18,
  iconUrl: "https://example.com",
  sendable: true,
  popular: true,
  refundable: true,
  listed: true,
  tradable: true,
  category: "tokens",
  pricingId: 1,
}

const defaultApiTokenData: ApiTokensInfoResponse = {
  tokens: [defaultApiTokenDetails],
}

const defaultTokenWithBalance: TokenWithBalance = {
  ...defaultToken,
  balance: BigInt(100).toString(),
  account: getMockWalletAccount({}),
}

const defaultBaseTokenWithBalance: BaseTokenWithBalance = {
  ...defaultToken,
  balance: BigInt(100).toString(),
  account: getMockWalletAccount({}).address,
}

const defaultTokenWithOptionalBigIntBalance: TokenWithOptionalBigIntBalance = {
  ...defaultToken,
  balance: BigInt(100),
}

export const defaultTokenWithPrice: TokenWithPrice = {
  ...defaultToken,
  usdValue: "100",
  pricingId: 1,
}

export const defaultTokenPriceDetails: TokenPriceDetails = {
  ...defaultBaseToken,
  pricingId: 1,
  ethValue: "0.6",
  ccyValue: "2000",
  ethDayChange: "0.1",
  ccyDayChange: "0.2",
}

export const getMockBaseToken = (overrides?: Partial<BaseToken>) => ({
  ...defaultBaseToken,
  ...(overrides ?? {}),
})

export const getMockToken = (overrides?: Partial<Token>) => ({
  ...defaultToken,
  ...(overrides ?? {}),
})

export const getMockApiTokenDetails = (overrides?: Partial<ApiTokenInfo>) => ({
  ...defaultApiTokenDetails,
  ...(overrides ?? {}),
})

export const getMockApiTokenData = (
  overrides?: Partial<ApiTokensInfoResponse>,
) => ({
  ...defaultApiTokenData,
  ...(overrides ?? {}),
})

export const getMockTokenWithBalance = (
  overrides?: Partial<TokenWithBalance>,
) => ({
  ...defaultTokenWithBalance,
  ...(overrides ?? {}),
})

export const getMockBaseTokenWithBalance = (
  overrides?: Partial<BaseTokenWithBalance>,
) => ({
  ...defaultBaseTokenWithBalance,
  ...(overrides ?? {}),
})

export const getMockTokenWithOptionalBigIntBalance = (
  overrides?: Partial<TokenWithOptionalBigIntBalance>,
) => ({
  ...defaultTokenWithOptionalBigIntBalance,
  ...(overrides ?? {}),
})

export const getMockTokenWithPrice = (overrides?: Partial<TokenWithPrice>) => ({
  ...defaultTokenWithPrice,
  ...(overrides ?? {}),
})

export const getMockTokenPriceDetails = (
  overrides?: Partial<TokenPriceDetails>,
) => ({
  ...defaultTokenPriceDetails,
  ...(overrides ?? {}),
})
