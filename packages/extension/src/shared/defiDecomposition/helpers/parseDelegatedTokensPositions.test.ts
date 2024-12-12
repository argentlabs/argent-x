import { getMockAccount } from "../../../../test/account.mock"
import { delegatedTokensPositions } from "../__fixtures__/delegatedTokensPositions"
import { concentratedLiquidityPositions } from "../__fixtures__/concentratedLiquidityPositions"
import { parseDelegatedTokensPositions } from "./parseDelegatedTokensPositions"

describe("parseDelegatedTokensPositions", () => {
  const mockAccount = getMockAccount({
    address: "0x123",
    networkId: "sepolia-alpha",
  })

  beforeEach(() => {})

  afterEach(async () => {
    vi.clearAllMocks()
  })

  it("should parse delegated tokens positions", async () => {
    const result = parseDelegatedTokensPositions(
      delegatedTokensPositions,
      mockAccount,
    )

    expect(result).toBeDefined()
    expect(result).toHaveLength(2)
    expect(result[0].delegatingTo).toBe(
      "0x04d8d7295721a1b972f5b9723f47ac73b1567c8d1e889cdc208840fb07816a54",
    )
    expect(result[0].token.address).toBe(
      "0x01fad7c03b2ea7fbef306764e20977f8d4eae6191b3a54e4514cc5fc9d19e569",
    )
    expect(result[0].token.balance).toBe("528263624904970685")
    expect(result[1].delegatingTo).toBe(
      "0x064d28d1d1d53a0b5de12e3678699bc9ba32c1cb19ce1c048578581ebb7f8396",
    )
    expect(result[1].token.address).toBe(
      "0x01fad7c03b2ea7fbef306764e20977f8d4eae6191b3a54e4514cc5fc9d19e569",
    )
    expect(result[1].token.balance).toBe("29364244105174014")
  })

  it("should return an empty array for non-delegated tokens positions", async () => {
    const result = parseDelegatedTokensPositions(
      concentratedLiquidityPositions,
      mockAccount,
    )

    expect(result).toHaveLength(0)
  })
})
