import { describe, expect, test } from "vitest"

import { omitEmpty } from "../src/shared/utils/object"

describe("omitEmpty", () => {
  describe("when valid", () => {
    test("should omit empty values", () => {
      expect(
        omitEmpty({
          a: "",
          b: {},
          c: "foo",
          d: {
            a: "",
            b: "bar",
            c: {
              d: "foo",
            },
          },
          e: 0,
          f: null,
          g: [0, null, "", {}, "baz"],
          h: true,
          i: false,
        }),
      ).toMatchInlineSnapshot(`
        {
          "c": "foo",
          "d": {
            "b": "bar",
            "c": {
              "d": "foo",
            },
          },
          "e": 0,
          "f": null,
          "g": [
            0,
            null,
            "baz",
          ],
          "h": true,
          "i": false,
        }
      `)
    })
  })
})
