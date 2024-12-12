import { describe, expect, test } from "vitest"

import { actionQueueItemMetaSchema } from "./schema"

describe("actionQueue", () => {
  describe("schema", () => {
    describe("when valid", () => {
      test("should be successful", () => {
        expect(
          actionQueueItemMetaSchema.safeParse({
            hash: "0x0123",
            expires: 0,
          }).success,
        ).toBeTruthy()
        expect(
          actionQueueItemMetaSchema.safeParse({
            hash: "0x0123",
            expires: 0,
            icon: "SendSecondaryIcon",
          }).success,
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("should not be successful", () => {
        expect(
          actionQueueItemMetaSchema.safeParse({
            hash: "0x0123",
            expires: 0,
            icon: "InvalidIcon",
          }).success,
        ).toBeFalsy()
      })
    })
  })
})
