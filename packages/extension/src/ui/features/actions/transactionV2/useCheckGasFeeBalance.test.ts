import type { EnrichedSimulateAndReviewV2 } from "@argent/x-shared/simulation"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { TokenWithBalance } from "@argent/x-shared"
import { STRK_TOKEN_ADDRESS } from "@argent/x-shared"
import { useCheckGasFeeBalance } from "./useCheckGasBalance"

describe("checkGasFeeBalance", () => {
  const feeTokenAddress = STRK_TOKEN_ADDRESS

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns false when account has enough balance to cover sent amount and gas", async () => {
    const result = {
      transactions: [
        {
          simulation: {
            summary: [
              {
                sent: true,
                token: { address: feeTokenAddress },
                value: BigInt(1000),
              },
            ],
          },
        },
      ],
      enrichedFeeEstimation: [
        {
          type: "native",
          transactions: {
            feeTokenAddress,
            max: { amount: BigInt(500), pricePerUnit: BigInt(1) },
          },
        },
      ],
    } as unknown as EnrichedSimulateAndReviewV2

    const hasEnoughBalance = useCheckGasFeeBalance({
      result,
      feeTokenWithBalance: {
        address: feeTokenAddress,
        balance: BigInt(2000),
      } as unknown as TokenWithBalance,
    })
    expect(hasEnoughBalance).toBe(false)
  })

  it("returns true when account does not have enough balance to cover sent amount and gas", async () => {
    const result = {
      transactions: [
        {
          simulation: {
            summary: [
              {
                sent: true,
                token: { address: feeTokenAddress },
                value: BigInt(2000),
              },
            ],
          },
        },
      ],
      enrichedFeeEstimation: [
        {
          type: "native",
          transactions: {
            feeTokenAddress: feeTokenAddress,
            max: { amount: BigInt(500), pricePerUnit: BigInt(1) },
          },
        },
      ],
    } as unknown as EnrichedSimulateAndReviewV2

    const hasEnoughBalance = useCheckGasFeeBalance({
      result,
      feeTokenWithBalance: {
        address: feeTokenAddress,
        balance: BigInt(2000),
      } as unknown as TokenWithBalance,
    })
    expect(hasEnoughBalance).toBe(true)
  })

  it("returns false when there are no transactions in the result", async () => {
    const result = {
      transactions: [],
    }

    const hasEnoughBalance = useCheckGasFeeBalance({
      result,
      feeTokenWithBalance: {
        address: feeTokenAddress,
        balance: BigInt(0),
      } as unknown as TokenWithBalance,
    })
    expect(hasEnoughBalance).toBe(false)
  })

  it("returns false when the fee token is not included in the sent transactions", async () => {
    const result = {
      transactions: [
        {
          simulation: {
            summary: [
              {
                sent: true,
                token: { address: "0xOtherTokenAddress" },
                value: "1000",
              },
            ],
          },
        },
      ],
      enrichedFeeEstimation: [
        {
          type: "native",
          transactions: {
            feeTokenAddress: feeTokenAddress,
            max: { amount: BigInt(500), pricePerUnit: BigInt(1) },
          },
        },
      ],
    } as unknown as EnrichedSimulateAndReviewV2

    const hasEnoughBalance = useCheckGasFeeBalance({
      result,
      feeTokenWithBalance: {
        address: feeTokenAddress,
        balance: BigInt(0),
      } as unknown as TokenWithBalance,
    })
    expect(hasEnoughBalance).toBe(false)
  })

  it("returns true when account does not have enough balance for v3 transactions", async () => {
    const result = {
      transactions: [
        {
          simulation: {
            summary: [
              {
                sent: true,
                token: { address: feeTokenAddress },
                value: BigInt(2000),
              },
            ],
          },
        },
      ],
      enrichedFeeEstimation: [
        {
          type: "native",
          transactions: {
            feeTokenAddress: feeTokenAddress,
            amount: BigInt(100),
            pricePerUnit: BigInt(5), // amount * price = 500 (same as previous max.amount test)
          },
        },
      ],
    } as unknown as EnrichedSimulateAndReviewV2

    const hasEnoughBalance = useCheckGasFeeBalance({
      result,
      feeTokenWithBalance: {
        address: feeTokenAddress,
        balance: BigInt(2400),
      } as unknown as TokenWithBalance,
    })
    expect(hasEnoughBalance).toBe(false)
  })

  it("returns false when the user sends and receives the same token amount (net outflow = 0) and has enough to cover gas", async () => {
    // We send 1000 and receive 1000 of the same token
    // so netSentAmount = 1000 - 1000 = 0.
    // The fee is 500, and we have a balance of 600,
    // so 600 > 500 + 0 => sufficient to cover gas.
    const result = {
      transactions: [
        {
          simulation: {
            summary: [
              {
                sent: true,
                token: { address: feeTokenAddress },
                value: BigInt(1000), // user sends 1000
              },
              {
                sent: false,
                token: { address: feeTokenAddress },
                value: BigInt(1000), // user receives 1000
              },
            ],
          },
        },
      ],
      enrichedFeeEstimation: [
        {
          type: "native",
          transactions: {
            feeTokenAddress,
            max: {
              amount: BigInt(100), // gas fee
              pricePerUnit: BigInt(5),
            },
          },
        },
      ],
    } as unknown as EnrichedSimulateAndReviewV2

    // The user's balance is 600. They only need to cover the 500 gas fee,
    // because netSent = 0.
    const hasEnoughBalance = useCheckGasFeeBalance({
      result,
      feeTokenWithBalance: {
        address: feeTokenAddress,
        balance: BigInt(600),
      } as unknown as TokenWithBalance,
    })

    // Expect: false => means "no error" / "we do have enough"
    expect(hasEnoughBalance).toBe(false)
  })

  it("returns false when user receives more than they send (negative netSent) and has enough balance to cover gas", async () => {
    // sends 500, receives 1000 => netSent = 500 - 1000 = -500
    const result = {
      transactions: [
        {
          simulation: {
            summary: [
              {
                sent: true,
                token: { address: feeTokenAddress },
                value: BigInt(500),
              },
              {
                sent: false,
                token: { address: feeTokenAddress },
                value: BigInt(1000),
              },
            ],
          },
        },
      ],
      enrichedFeeEstimation: [
        {
          type: "native",
          transactions: {
            feeTokenAddress,
            max: {
              amount: BigInt(100), // gas fee
              pricePerUnit: BigInt(2),
            },
          },
        },
      ],
    } as unknown as EnrichedSimulateAndReviewV2

    // netSentAmount = 500 - 1000 = -500
    // So effectively, the user gains tokens while paying 200 for gas.
    const hasEnoughBalance = useCheckGasFeeBalance({
      result,
      feeTokenWithBalance: {
        address: feeTokenAddress,
        balance: BigInt(100),
      } as unknown as TokenWithBalance,
    })

    // 100 > 200 + (-500) => 100 > -300 => true
    // So it should also be false (meaning "no error")
    expect(hasEnoughBalance).toBe(false)
  })
})
