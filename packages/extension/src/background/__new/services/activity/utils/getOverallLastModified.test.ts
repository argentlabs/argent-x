import { describe, expect, test } from "vitest"

import activities from "../__fixtures__/activities.json"
import type { Activity } from "../schema"
import { getOverallLastModified } from "./getOverallLastModified"

describe("background/services/activity/utils", () => {
  describe("getOverallLastModified", () => {
    describe("when valid", () => {
      test("returns the most recent lastModified", () => {
        expect(
          getOverallLastModified(activities as Activity[]),
        ).toMatchInlineSnapshot(`1701964096841`)
      })
    })
  })
})
