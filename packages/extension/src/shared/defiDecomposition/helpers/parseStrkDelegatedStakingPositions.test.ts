import { getMockAccount } from "../../../../test/account.mock"
import { strkDelegatedStakingPositions } from "../__fixtures__/strkDelegatedStakingPositions"
import { concentratedLiquidityPositions } from "../__fixtures__/concentratedLiquidityPositions"

import { parseStrkDelegatedStakingPositions } from "./parseStrkDelegatedStakingPositions"

describe("parseStrkDelegatedStakingPositions", () => {
  const mockAccount = getMockAccount({
    address: "0x123",
    networkId: "sepolia-alpha",
  })

  afterEach(async () => {
    vi.clearAllMocks()
  })

  it("should parse STRK delegated staking positions", async () => {
    const result = parseStrkDelegatedStakingPositions(
      strkDelegatedStakingPositions,
      mockAccount,
    )

    expect(result).toBeDefined()
    expect(result).toHaveLength(1)
    expect(result[0].apy).toBe("0.015014")
    expect(result[0].accruedRewards).toBe("0")
    expect(result[0].stakerInfo).toEqual({
      name: "Voyager",
      iconUrl: "https://www.dappland.com/dapps/voyager/dapp-icon-voyager.png",
      address:
        "0x7aa2d3f4d79ed1c2183969b353f4f678559ca72a65dae207395a247c968af93",
    })
    expect(result[0].token.address).toBe(
      "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    )
    expect(result[0].token.balance).toBe("9999999900000000")
  })

  it("should return an empty array for non-STRK delegated staking positions", async () => {
    const result = await parseStrkDelegatedStakingPositions(
      concentratedLiquidityPositions,
      mockAccount,
    )

    expect(result).toHaveLength(0)
  })
})
