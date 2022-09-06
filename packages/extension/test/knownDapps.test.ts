import { describe, expect, test } from "vitest"

import {
  getKnownDappForContractAddress,
  getKnownDappForHost,
} from "../src/shared/knownDapps"

describe("knownDapps", () => {
  describe("getKnownDappForContractAddress", () => {
    describe("when valid", () => {
      test("should return the expected dapp record", () => {
        /** with leading zero */
        expect(
          getKnownDappForContractAddress(
            "0x0266b1276d23ffb53d99da3f01be7e29fa024dd33cd7f7b1eb7a46c67891c9d0",
          ),
        ).toHaveProperty("hosts", ["briq.construction"])
        /** without leading zero */
        expect(
          getKnownDappForContractAddress(
            "0x266b1276d23ffb53d99da3f01be7e29fa024dd33cd7f7b1eb7a46c67891c9d0",
          ),
        ).toHaveProperty("hosts", ["briq.construction"])
      })
    })
    describe("when invalid", () => {
      test("should return undefined", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(getKnownDappForContractAddress({})).toBeUndefined()
        expect(getKnownDappForContractAddress("foo")).toBeUndefined()
      })
    })
  })
  describe("getKnownDappForHost", () => {
    describe("when valid", () => {
      test("should return the expected dapp record", () => {
        expect(getKnownDappForHost("briq.construction")).toHaveProperty(
          "hosts",
          ["briq.construction"],
        )
      })
    })
    describe("when invalid", () => {
      test("should return undefined", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(getKnownDappForHost({})).toBeUndefined()
        expect(getKnownDappForHost("foo")).toBeUndefined()
      })
    })
  })
})
