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
      expect(networkSchema.validateSync(defaultLocalhostNetwork)).toEqual(
        defaultLocalhostNetwork,
      )
    })
    test("should allow accountClassHash with valid argentAccount", () => {
      expect(defaultNetwork).toEqual(defaultNetwork)
    })
  })
  describe("when invalid", () => {
    test("should not allow accountClassHash to be defined with missing argentAccount", () => {
      expect(() =>
        networkSchema.validateSync({
          ...defaultLocalhostNetwork,
          accountClassHash: {},
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        '"Account class hash is a required field"',
      )
    })
    test("should not allow accountClassHash with invalid argentAccount", () => {
      expect(() =>
        networkSchema.validateSync({
          ...defaultLocalhostNetwork,
          accountClassHash: {
            standard: "foo",
          },
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        '"Account class hash must match the following: \\"/^0x[a-f0-9]+$/i\\""',
      )
    })
  })
})
