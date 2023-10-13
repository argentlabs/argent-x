import { describe, expect, test } from "vitest"

import { parseQuery, sendQuerySchema } from "./schema"

describe("send", () => {
  describe("schema", () => {
    describe("when valid", () => {
      test("should extract the values", () => {
        expect(
          parseQuery(new URLSearchParams(), sendQuerySchema),
        ).toMatchInlineSnapshot("{}")
        expect(
          parseQuery(
            new URLSearchParams({
              tokenId: "123",
            }),
            sendQuerySchema,
          ),
        ).toEqual({
          tokenId: "123",
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
            }),
            sendQuerySchema,
          ),
        ).toEqual({
          tokenId: "123",
        })
      })
    })
  })
})
