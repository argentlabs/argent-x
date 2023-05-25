import { describe, expect, test } from "vitest"
import { ZodError } from "zod"

import {
  defaultNetwork,
  defaultNetworks,
  networkSchema,
} from "../src/shared/network"

const defaultLocalhostNetwork = defaultNetworks.find(
  ({ id }) => id === "localhost",
)

describe("networkSchema", () => {
  describe("when valid", () => {
    test("should allow accountClassHash to be missing", () => {
      expect(networkSchema.parse(defaultLocalhostNetwork)).toEqual(
        defaultLocalhostNetwork,
      )
    })
    test("should allow accountClassHash with valid argentAccount", () => {
      expect(defaultNetwork).toEqual(defaultNetwork)
    })
  })
  describe("when invalid", () => {
    test("should not allow accountClassHash with invalid argentAccount", () => {
      expect(
        networkSchema.safeParse({
          ...defaultLocalhostNetwork,
          accountClassHash: {
            standard: "foo",
          },
        }),
      ).toEqual({
        error: new ZodError([
          {
            validation: "regex",
            code: "invalid_string",
            message:
              "Account class hash must match the following: /^0x[a-f0-9]+$/i",
            path: ["accountClassHash", "standard"],
          },
        ]),
        success: false,
      })
    })
  })
})
