import { StoragePonyfill } from "../StoragePonyfill"

// Write tests for the file packages/extension/src/shared/storage/SessionStoragePonyfill.ts

describe("SessionStoragePonyfill", () => {
  describe("constructor", () => {
    test("should create a new instance", async () => {
      const store = new StoragePonyfill("session")
      expect(store).toBeTruthy()
    })
  })

  // TODO: Need more tests
})
