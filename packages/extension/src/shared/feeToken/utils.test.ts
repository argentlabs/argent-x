import { describe, it, expect } from "vitest"
import { Address } from "@argent/x-shared"
import { BaseTokenWithBalance } from "../token/__new/types/tokenBalance.model"
import { STRK_TOKEN_ADDRESS } from "../network/constants"
import { pickBestFeeToken } from "./utils"

function getMockToken(options: {
  address: Address
  balance: string
}): BaseTokenWithBalance {
  return {
    account: { address: "0x0", networkId: "localhost" },
    address: options.address,
    balance: options.balance,
    networkId: "localhost",
  }
}
const mockTokens: BaseTokenWithBalance[] = [
  getMockToken({ address: "0x1", balance: "0" }),
  getMockToken({ address: "0x2", balance: "10" }),
  getMockToken({ address: "0x3", balance: "0" }),
  getMockToken({ address: "0x4", balance: "0" }),
  getMockToken({ address: "0x5", balance: "0" }),
  getMockToken({ address: STRK_TOKEN_ADDRESS, balance: "12" }),
  getMockToken({ address: "0x7", balance: "10" }),
  getMockToken({ address: "0x8", balance: "0" }),
]

describe("pickBestFeeToken", () => {
  it("should return the token from the default list", () => {
    const result = pickBestFeeToken(mockTokens)
    expect(result).toEqual(mockTokens[5])
  })

  it("should return token from default list if all balances are 0", () => {
    const zeroBalanceTokens = mockTokens.map((token) => ({
      ...token,
      balance: "0",
    }))
    const result = pickBestFeeToken(zeroBalanceTokens)
    expect(result).toEqual(zeroBalanceTokens[5])
  })

  it("should prefer tokens in the 'prefer' list", () => {
    const result = pickBestFeeToken(mockTokens, { prefer: ["0x2", "0x7"] })
    expect(result).toEqual(mockTokens[1])
  })

  it("should avoid tokens in the 'avoid' list", () => {
    const result = pickBestFeeToken(mockTokens, { avoid: [STRK_TOKEN_ADDRESS] })
    expect(result).toEqual(mockTokens[1])
  })

  it("should prefer tokens in the 'prefer' list even if they have a lower balance", () => {
    const result = pickBestFeeToken(mockTokens, { prefer: ["0x2", "0x7"] })
    expect(result).toEqual(mockTokens[1])
  })

  it("should return a token even if no token has a balance", () => {
    const result = pickBestFeeToken(
      mockTokens.filter((token) => token.balance === "0"),
    )
    expect(result).toEqual(mockTokens[0])
  })

  it("should return a token even if no token has a balance and there are tokens in the 'prefer' list", () => {
    const result = pickBestFeeToken(
      mockTokens.filter((token) => token.balance === "0"),
      { prefer: ["0x2", "0x7"] },
    )
    expect(result).toEqual(mockTokens[0])
  })
})
