import { GatewayError } from "starknet"
import { describe, expect, test } from "vitest"

import { fetcherError } from "../../../../shared/api/fetcher"
import { UNKNOWN_ERROR_MESSAGE } from "../../../../shared/utils/error"
import { getParsedFeeError } from "./feeError"

describe("features/actions/feeEstimation/feeError", () => {
  describe("getParsedFeeError", () => {
    describe("when valid", () => {
      test("returns expected error shape", () => {
        test("String", () => {
          expect(getParsedFeeError("foo")).toEqual({
            message: "foo",
          })
        })
        test("Error", () => {
          expect(getParsedFeeError(new Error("foo"))).toEqual({
            message: "foo",
          })
        })
        test("GatewayError", () => {
          expect(
            getParsedFeeError(
              new GatewayError("foo", "StarknetErrorCode.FOO_BAR_BAZ"),
            ),
          ).toEqual({
            message: "foo",
            title: "Foo bar baz",
          })
        })
        test("FetcherError", () => {
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
      })
    })
    describe("when invalid", () => {
      test("returns UNKNOWN_ERROR_MESSAGE", () => {
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
})
