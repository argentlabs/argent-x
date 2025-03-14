import { getMockWalletAccount } from "../../../../test/walletAccount.mock"
import { defiDecomposition } from "../__fixtures__/defiDecomposition"
import { tokens } from "../__fixtures__/tokens"
import { parseDefiDecomposition } from "./parseDefiDecomposition"

describe("parseDefiDecomposition", () => {
  const mockAccount = getMockWalletAccount({
    address: "0x123",
    networkId: "sepolia-alpha",
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should parse defi decomposition", async () => {
    const result = parseDefiDecomposition(
      defiDecomposition,
      mockAccount,
      tokens,
    )

    expect(result).toBeDefined()
    expect(result).toHaveLength(3)

    // Check the first dapp
    expect(result[0].dappId).toBe("b513a7c1-eb8a-4201-876c-becd8d445e15")
    expect(result[0].products).toHaveLength(1)
    expect(result[0].products[0].type).toBe("delegatedTokens")
    expect(result[0].products[0].name).toBe("Delegated governance")

    // Check the second dapp
    expect(result[1].dappId).toBe("02d43d9d-b82e-44fb-aaa1-69753adc2f14")
    expect(result[1].products).toHaveLength(2)
    expect(result[1].products[0].type).toBe("collateralizedDebtLendingPosition")
    expect(result[1].products[0].name).toBe("Lending")
    expect(result[1].products[0].positions).toHaveLength(2)
    expect(result[1].products[1].type).toBe(
      "collateralizedDebtBorrowingPosition",
    )
    expect(result[1].products[1].name).toBe("Borrowing")
    expect(result[1].products[1].positions).toHaveLength(3)

    // Check the third dapp
    expect(result[2].dappId).toBe("49007844-7a78-4185-be2f-b06bf6fc26a5")
    expect(result[2].products).toHaveLength(1)
    expect(result[2].products[0].type).toBe("staking")
    expect(result[2].products[0].name).toBe("Liquid staking")
  })

  it("should handle empty dapps array", async () => {
    const emptyDefiDecomposition = { dapps: [] }
    const result = parseDefiDecomposition(
      emptyDefiDecomposition,
      mockAccount,
      tokens,
    )

    expect(result).toBeDefined()
    expect(result).toHaveLength(0)
  })
})
