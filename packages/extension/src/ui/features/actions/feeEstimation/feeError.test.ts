import { LibraryError } from "starknet"
import { describe, expect, test } from "vitest"

import { fetcherError } from "../../../../shared/api/fetcher"
import { UNKNOWN_ERROR_MESSAGE } from "../../../../shared/utils/error"
import { getParsedFeeError } from "./feeError"

describe("features/actions/feeEstimation/feeError", () => {
  describe("getParsedFeeError", () => {
    test("returns expected error shape for String", () => {
      expect(getParsedFeeError("foo")).toEqual({
        message: "foo",
      })
    })
    test("returns expected error shape for Error", () => {
      expect(getParsedFeeError(new Error("foo"))).toEqual({
        message: "foo",
      })
    })
    test("returns expected error shape for GatewayError", () => {
      expect(getParsedFeeError(new LibraryError("foo"))).toEqual({
        message: "foo",
      })
    })
    test("returns expected error shape for FetcherError", () => {
      expect(
        getParsedFeeError(
          fetcherError(
            "foo",
            new Response(),
            JSON.stringify({ status: "fooBarBaz", message: "foo" }),
          ),
        ),
      ).toEqual({
        message: "foo",
        title: "Foo bar baz",
      })
    })
    test("returns UNKNOWN_ERROR_MESSAGE when invalid", () => {
      expect(getParsedFeeError()).toEqual({ message: UNKNOWN_ERROR_MESSAGE })
      expect(getParsedFeeError({})).toEqual({
        message: UNKNOWN_ERROR_MESSAGE,
      })
      // @ts-expect-error intentionally passing invalid argument(s) for testing
      expect(getParsedFeeError(null)).toEqual({
        message: UNKNOWN_ERROR_MESSAGE,
      })
      // @ts-expect-error intentionally passing invalid argument(s) for testing
      expect(getParsedFeeError([])).toEqual({
        message: UNKNOWN_ERROR_MESSAGE,
      })
      // @ts-expect-error intentionally passing invalid argument(s) for testing
      expect(getParsedFeeError(123)).toEqual({
        message: UNKNOWN_ERROR_MESSAGE,
      })
    })
  })
})
