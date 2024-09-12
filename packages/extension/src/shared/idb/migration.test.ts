import "fake-indexeddb/auto"
import { describe, it, afterEach, vi } from "vitest"
import { ArgentDatabase } from "./db" // Adjust the import path as needed
import { Hex } from "@argent/x-shared"

const mockTokensWithBalance = [
  {
    account:
      "0x003cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed92894c1",
    address:
      "0x003cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed92894c2" as Hex,
    networkId: "sepolia-alpha",
    balance: BigInt(100).toString(),
  },
  {
    account:
      "0x003cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed92894c3",
    address:
      "0x003cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed92894c4" as Hex,
    networkId: "sepolia-alpha",
    balance: BigInt(100).toString(),
  },
]

describe("migrate ArgentDatabase", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("from version 2 to version 3", async () => {
    let db = new ArgentDatabase({ version: 2, skipAddressNormalizer: true })

    await db.tokenBalances.bulkAdd(mockTokensWithBalance)

    await db.close()
    db = new ArgentDatabase()
    await db.open()

    const tokenBalances = await db.tokenBalances.toArray()

    expect(tokenBalances[0]).toEqual({
      account:
        "0x3cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed92894c1", // normalized
      address:
        "0x3cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed92894c2", // normalized
      balance: "100",
      networkId: "sepolia-alpha",
    })
    expect(tokenBalances[1]).toEqual({
      account:
        "0x3cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed92894c3", // normalized
      address:
        "0x3cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed92894c4", // normalized
      balance: "100",
      networkId: "sepolia-alpha",
    })
  })
})
