import { MinimalProviderInterface } from "@argent/x-multicall"
import { Call } from "starknet"
import { Mocked, describe, expect, test } from "vitest"

import { multicallWithCairo0Fallback } from "./multicallWithCairo0Fallback"

describe("shared/account/details", () => {
  describe("multicallWithCairo0Fallback", () => {
    describe("when the call is successful", () => {
      test("makes a single Cairo 1 call and returns the result", async () => {
        const multicall = {
          callContract: vi.fn(),
        } as Mocked<MinimalProviderInterface>
        const call: Call = {
          entrypoint: "fooBar",
          contractAddress: "0x0",
        }
        multicall.callContract.mockResolvedValueOnce({ result: ["baz"] })
        const result = await multicallWithCairo0Fallback(call, multicall)
        expect(multicall.callContract).toHaveBeenCalledOnce()
        expect(multicall.callContract).toHaveBeenLastCalledWith(
          expect.objectContaining({ entrypoint: "foo_bar" }),
        )
        expect(result).toEqual({
          result: ["baz"],
        })
      })
    })
    describe("when the call fails", () => {
      test("makes a Cairo 1 then a Cairo 0 call and returns the result", async () => {
        const multicall = {
          callContract: vi.fn(),
        } as Mocked<MinimalProviderInterface>
        const call: Call = {
          entrypoint: "fooBar",
          contractAddress: "0x0",
        }
        // { result: undefined } is not valid, but is returned if the first call fails
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        multicall.callContract.mockResolvedValueOnce({ result: undefined })
        multicall.callContract.mockResolvedValueOnce({ result: ["baz"] })
        const result = await multicallWithCairo0Fallback(call, multicall)
        expect(multicall.callContract).toHaveBeenCalledTimes(2)
        expect(multicall.callContract).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({ entrypoint: "foo_bar" }),
        )
        expect(multicall.callContract).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({ entrypoint: "fooBar" }),
        )
        expect(result).toEqual({
          result: ["baz"],
        })
      })
    })
  })
})
