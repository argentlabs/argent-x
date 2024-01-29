import { describe, expect, test } from "vitest"

import activities from "./__fixtures__/activities.json"
import activitiesManyEscapes from "./__fixtures__/activities-many-escapes.json"
import activitiesSignerChanged from "./__fixtures__/activities-signer-changed.json"
import { activitiesSchema } from "./schema"

describe("background/services/activity", () => {
  describe("schema", () => {
    describe("when valid", () => {
      test("success should be true", () => {
        expect(activitiesSchema.safeParse(activities).success).toBeTruthy()
        expect(
          activitiesSchema.safeParse(activitiesManyEscapes).success,
        ).toBeTruthy()
        expect(
          activitiesSchema.safeParse(activitiesSignerChanged).success,
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("success should be false", () => {
        expect(activitiesSchema.safeParse([{}]).success).toBeFalsy()
      })
    })
  })
})
