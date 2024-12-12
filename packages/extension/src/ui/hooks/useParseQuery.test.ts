import { describe, expect, test } from "vitest"

import { parseQuery } from "./useParseQuery"
import { stark } from "starknet"
import { addressSchema } from "@argent/x-shared"
import { sendQuerySchema } from "../../shared/send/schema"

const mockTokenAddress = addressSchema.parse(stark.randomAddress())

describe("parseQuery", () => {
  describe("when valid", () => {
    test("should extract the values", () => {
      expect(
        parseQuery(new URLSearchParams(), sendQuerySchema),
      ).toMatchInlineSnapshot("{}")
      expect(
        parseQuery(
          new URLSearchParams({
            tokenId: "123",
            tokenAddress: mockTokenAddress,
          }),
          sendQuerySchema,
        ),
      ).toEqual({
        tokenId: "123",
        tokenAddress: mockTokenAddress,
      })
    })
  })
  describe("when invalid", () => {
    test("should ignore invalid values", () => {
      expect(
        parseQuery(new URLSearchParams({ foo: "bar" }), sendQuerySchema),
      ).toMatchInlineSnapshot("{}")
      expect(
        parseQuery(
          new URLSearchParams({
            foo: "bar",
            tokenId: "123",
            tokenAddress: mockTokenAddress,
          }),
          sendQuerySchema,
        ),
      ).toEqual({
        tokenId: "123",
        tokenAddress: mockTokenAddress,
      })
    })
  })
})
