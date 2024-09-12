import { describe, vi } from "vitest"

import { getSeedPhrase } from "./useGlobalUtilityMethods"

vi.mock("../services/session", () => {
  return {
    sessionService: {
      startSession: vi
        .fn()
        .mockRejectedValueOnce(new Error())
        .mockResolvedValueOnce({}),
    },
  }
})

vi.mock("../services/accountMessaging", () => {
  return {
    accountMessagingService: {
      getSeedPhrase: vi.fn().mockResolvedValueOnce("test seed"),
    },
  }
})

describe("getSeedPhrase", () => {
  it("show throw an error if no password is given", async () => {
    await expect(getSeedPhrase("")).rejects.toThrow("Password is required")
  })

  it("show throw an error if the password is wrong", async () => {
    await expect(getSeedPhrase("abc123")).rejects.toThrow("Invalid password")
  })

  it("should return the seedphrase", async () => {
    const seed = await getSeedPhrase("abc123")
    expect(seed).toBe("test seed")
  })
})
