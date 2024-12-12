import type { EnrichedSimulateAndReview } from "@argent/x-shared/simulation"
import { beforeEach, describe, expect, it, vi } from "vitest"
import * as tokenServices from "../../../services/tokens"
import { checkGasFeeBalance } from "./useTransactionReviewV2"

vi.mock("../../../services/tokens", () => ({
  clientTokenService: {
    fetchTokenBalance: vi.fn(),
    getTokenBalance: vi.fn(),
  },
}))

describe("checkGasFeeBalance", () => {
  const feeTokenAddress = "0xTokenAddress"
  const currentAccount = {
    address: "0xAccountAddress",
    networkId: "networkid",
    id: "id",
  }

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
      enrichedFeeEstimation: {
        transactions: {
          feeTokenAddress: feeTokenAddress,
          max: { amount: BigInt(500) },
        },
      },
    } as unknown as EnrichedSimulateAndReview
    vi.mocked(
      tokenServices.clientTokenService.fetchTokenBalance,
    ).mockResolvedValue("2000") // Account balance

    const hasEnoughBalance = await checkGasFeeBalance(
      result,
      feeTokenAddress,
      currentAccount,
    )
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
      enrichedFeeEstimation: {
        transactions: {
          feeTokenAddress: feeTokenAddress,
          max: { amount: BigInt(500) },
        },
      },
    } as unknown as EnrichedSimulateAndReview
    vi.mocked(
      tokenServices.clientTokenService.getTokenBalance,
    ).mockResolvedValue("2000")

    const hasEnoughBalance = await checkGasFeeBalance(
      result,
      feeTokenAddress,
      currentAccount,
    )
    expect(hasEnoughBalance).toBe(true)
  })

  it("returns false when there are no transactions in the result", async () => {
    const result = {
      transactions: [],
    }

    const hasEnoughBalance = await checkGasFeeBalance(
      result,
      feeTokenAddress,
      currentAccount,
    )
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
      enrichedFeeEstimation: {
        transactions: {
          feeTokenAddress: feeTokenAddress,
          max: { amount: "500" },
        },
      },
    } as unknown as EnrichedSimulateAndReview

    const hasEnoughBalance = await checkGasFeeBalance(
      result,
      feeTokenAddress,
      currentAccount,
    )
    expect(hasEnoughBalance).toBe(false)
  })
})
