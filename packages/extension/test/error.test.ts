import { describe, expect, test } from "vitest"

import { FetcherError } from "../src/shared/api/fetcher"
import {
  UNKNOWN_ERROR_MESSAGE,
  coerceErrorToString,
} from "../src/shared/utils/error"

describe("error", () => {
  describe("coerceErrorToString()", () => {
    describe("when valid", () => {
      describe("and given an Error object", () => {
        test("returns parsed error", () => {
          const error: FetcherError = new Error("Error message")
          error.url = "http://foo/v1/bar"
          error.status = 123
          error.statusText = "Foo bar"
          error.responseText = "Foo bar baz"
          /** 'false' excludes the stack trace which is environment-specific */
          expect(coerceErrorToString(error, false)).toMatchInlineSnapshot(`
          "{
            "message": "Error message",
            "url": "http://foo/v1/bar",
            "status": 123,
            "statusText": "Foo bar",
            "responseText": "Foo bar baz"
          }"
        `)
        })
      })
      describe("and given a plain object or array", () => {
        test("returns parsed object", () => {
          expect(coerceErrorToString({})).toMatchInlineSnapshot('"{}"')
          expect(coerceErrorToString({ foo: "bar" })).toMatchInlineSnapshot(`
          "{
            "foo": "bar"
          }"
        `)
          expect(coerceErrorToString([1, 2, 3])).toMatchInlineSnapshot(`
          "{
            "0": 1,
            "1": 2,
            "2": 3,
            "length": 3
          }"
        `)
        })
      })
      describe("and given a string", () => {
        test("returns the string", () => {
          expect(coerceErrorToString("foo bar")).toMatchInlineSnapshot(
            '"foo bar"',
          )
        })
      })
    })
    describe("when invalid", () => {
      test("returns unknown message without throwing", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(coerceErrorToString(null)).toEqual(UNKNOWN_ERROR_MESSAGE)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(coerceErrorToString("")).toEqual(UNKNOWN_ERROR_MESSAGE)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(coerceErrorToString()).toEqual(UNKNOWN_ERROR_MESSAGE)
      })
    })
  })
})
