import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { Network } from "../../../shared/network"
import { TransformedTransaction } from "./transform/type"
import { useTransactionFees } from "./useTransactionFees"

describe("useTransactionFees", () => {
  vi.mock("../../../shared/network", () => ({
    getProvider: vi.fn(() => {
      return {
        getTransactionReceipt: vi.fn(() => {
          return {
            actual_fee: "0",
          }
        }),
      }
    }),
  }))
  test("it should return backend enriched data when available ", async () => {
    const payload = {
      network: {} as Network,
      transactionTransformed: {
        actualFee: "1",
      } as TransformedTransaction,
      hash: undefined,
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
      hash: undefined,
    }
    const { result } = renderHook(() => useTransactionFees(payload))
    await waitFor(() => expect(result?.current).toBe("0"))
  })
})
