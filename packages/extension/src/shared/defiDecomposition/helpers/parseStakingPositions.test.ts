import { getMockWalletAccount } from "../../../../test/walletAccount.mock"
import { stakingPositions } from "../__fixtures__/stakingPositions"
import { concentratedLiquidityPositions } from "../__fixtures__/concentratedLiquidityPositions"

import { parseStakingPositions } from "./parseStakingPositions"

describe("parseStakingPositions", () => {
  const mockAccount = getMockWalletAccount({
    address: "0x123",
    networkId: "sepolia-alpha",
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should parse staking positions", async () => {
    const result = parseStakingPositions(stakingPositions, mockAccount)

    expect(result).toBeDefined()
    expect(result).toHaveLength(1)
    expect(result[0].apy).toBe("0.03192")
    expect(result[0].token.address).toBe(
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    )
    expect(result[0].token.balance).toBe("17431798489347591")
  })

  it("should return an empty array for non-staking positions", async () => {
    const result = parseStakingPositions(
      concentratedLiquidityPositions,
      mockAccount,
    )

    expect(result).toHaveLength(0)
  })
})
