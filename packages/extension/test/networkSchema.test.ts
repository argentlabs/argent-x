import { describe, expect, test } from "vitest"

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
      const result = networkSchema.safeParse({
        ...defaultLocalhostNetwork,
        accountClassHash: {
          standard: "foo",
        },
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toMatchObject([
          {
            validation: "regex",
            code: "invalid_string",
            message:
              "Account class hash must match the following: /^0x[a-f0-9]+$/i",
            path: ["accountClassHash", "standard"],
          },
        ])
      }
    })
  })
})
