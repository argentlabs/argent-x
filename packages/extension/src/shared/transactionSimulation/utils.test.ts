import { estimatedFeeToMaxFeeTotal } from "./utils"
import { EstimatedFee } from "./fees/fees.model"

describe("estimatedFeeToMaxFeeTotal", () => {
  it("should return the correct max fee total", () => {
    const estimatedFee: EstimatedFee = {
      feeTokenAddress: "0x123",
      amount: 100n,
      pricePerUnit: 10n,
      max: {
        maxFee: 200n,
      },
    }

    const result = estimatedFeeToMaxFeeTotal(estimatedFee)
    expect(result).toBe(200n)
  })

  it("should return the product of amount and pricePerUnit if watermarkedMaxFee is not provided", () => {
    const estimatedFee: EstimatedFee = {
      feeTokenAddress: "0x123",
      amount: 100n,
      pricePerUnit: 10n,
    }

    const result = estimatedFeeToMaxFeeTotal(estimatedFee)
    expect(result).toBeGreaterThan(1950)
    expect(result).toBeLessThan(2050)
  })

  it("should handle edge case where amount and pricePerUnit are zero", () => {
    const estimatedFee: EstimatedFee = {
      feeTokenAddress: "0x123",
      amount: 0n,
      pricePerUnit: 0n,
    }

    const result = estimatedFeeToMaxFeeTotal(estimatedFee)
    expect(result).toBe(0n)
  })

  it("should handle edge case where amount is zero and pricePerUnit is not", () => {
    const estimatedFee: EstimatedFee = {
      feeTokenAddress: "0x123",
      amount: 0n,
      pricePerUnit: 10n,
    }

    const result = estimatedFeeToMaxFeeTotal(estimatedFee)
    expect(result).toBe(0n)
  })

  it("should handle edge case where amount is not zero and pricePerUnit is zero", () => {
    const estimatedFee: EstimatedFee = {
      feeTokenAddress: "0x123",
      amount: 100n,
      pricePerUnit: 0n,
    }

    const result = estimatedFeeToMaxFeeTotal(estimatedFee)
    expect(result).toBe(0n)
  })

  it("should handle edge case where amount is negative", () => {
    const estimatedFee: EstimatedFee = {
      feeTokenAddress: "0x123",
      amount: -100n,
      pricePerUnit: 10n,
    }

    expect(() =>
      estimatedFeeToMaxFeeTotal(estimatedFee),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Cannot calculate max fee for negative fee]`,
    )
  })
})
