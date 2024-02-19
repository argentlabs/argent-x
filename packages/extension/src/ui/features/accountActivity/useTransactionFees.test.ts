import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { Network } from "../../../shared/network"
import { TransformedTransaction } from "./transform/type"
import { useTransactionFees } from "./useTransactionFees"

describe("useTransactionFees", () => {
  vi.mock("../../../shared/network", () => ({
    getProvider6: vi.fn(() => {
      return {
        getTransactionReceipt: vi.fn(() => {
          return {
            actual_fee: {
              amount: "0x1",
              unit: "WEI",
            },
          }
        }),
      }
    }),
  }))
  // TODO: reenable this test once we have the actual fee from the backend
  test.skip("it should return backend enriched data when available ", async () => {
    const payload = {
      network: {} as Network,
      transactionTransformed: {
        actualFee: "1",
      } as TransformedTransaction,
      hash: "0x123", // use this to prevent early return
    }
    const { result } = renderHook(() => useTransactionFees(payload))
    await waitFor(() => expect(result?.current).toBe("1"))
  })
  test("it should fallback to starknetjs data if backend data does not exist ", async () => {
    const payload = {
      network: {} as Network,
      transactionTransformed: {
        actualFee: undefined,
      } as TransformedTransaction,
      hash: "0x123",
    }
    const { result } = renderHook(() => useTransactionFees(payload))
    await waitFor(() =>
      expect(result?.current).toMatchObject({ amount: "0x1", unit: "WEI" }),
    )
  })
})
