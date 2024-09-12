import "fake-indexeddb/auto"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { ArgentDatabase } from "./db" // Adjust the import path as needed
import { Token } from "../token/__new/types/token.model"

const testTokens: Token[] = [
  {
    address:
      "0x003CEA9C0644433dAb0C431d63A8e0E51741f93AFAaFC3B1D81E193ed928945c1",
    networkId: "1",
    name: "Token One",
    symbol: "ONE",
    decimals: 18,
    id: 1,
    iconUrl: "https://example.com/icon1.png",
    showAlways: true,
    popular: true,
    custom: false,
    pricingId: 101,
    tradable: true,
    tags: ["DeFi", "Utility"],
  },
  {
    address:
      "0x003CEA9C0644433dAb0C431d63A8e0E51741f93AFAaFC3B1D81E193ed928945c2",
    networkId: "1",
    name: "Token Two",
    symbol: "TWO",
    decimals: 8,
    id: 2,
    iconUrl: "https://example.com/icon2.png",
    showAlways: false,
    popular: false,
    custom: true,
    pricingId: 102,
    tradable: false,
    tags: ["Governance"],
  },
]

const testTokens2: Token[] = [
  {
    address:
      "0x003CEA9C0644433dAb0C431d63A8e0E51741f93AFAaFC3B1D81E193ed928945c3",
    networkId: "1",
    name: "Token Three",
    symbol: "THREE",
    decimals: 6,
    id: 3,
    iconUrl: "https://example.com/icon3.png",
    showAlways: true,
    popular: true,
    custom: false,
    pricingId: 103,
    tradable: true,
    tags: ["Gaming", "NFT"],
  },
  {
    address:
      "0x003CEA9C0644433dAb0C431d63A8e0E51741f93AFAaFC3B1D81E193ed928945c4",
    networkId: "4",
    name: "Token Four",
    symbol: "FOUR",
    decimals: 4,
    id: 4,
    iconUrl: "https://example.com/icon4.png",
    showAlways: false,
    popular: false,
    custom: true,
    pricingId: 104,
    tradable: false,
    tags: ["Metaverse"],
  },
]

describe("ArgentDatabase", () => {
  let db: ArgentDatabase

  beforeEach(async () => {
    db = new ArgentDatabase()

    // Clear default tokens
    await db.tokens.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should sanitize addresses on add", async () => {
    const record = testTokens[0]

    await db.tokens.add(record)
    await db.tokens.put({ ...record, name: "Updated name" })

    const tokens = await db.tokens.toArray()

    expect(tokens.length).toBe(1)
    expect(tokens[0]).toEqual({
      ...record,
      address:
        "0x3cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed928945c1",
      name: "Updated name",
    })
  })

  it("should sanitize addresses on put", async () => {
    const record = testTokens[0]
    await db.tokens.put(record)

    const tokens = await db.tokens.toArray()

    expect(tokens[0]).toEqual({
      ...record,
      address:
        "0x3cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed928945c1",
    })
  })

  it("should sanitize addresses on put, and update existing record", async () => {
    const record = testTokens[0]
    await db.tokens.add(record)

    const tokens = await db.tokens.toArray()

    expect(tokens[0]).toEqual({
      ...record,
      address:
        "0x3cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed928945c1",
    })
  })

  it("should sanitize addresses on bulkAdd", async () => {
    await db.tokens.bulkAdd(testTokens2)

    const tokens = await db.tokens.toArray()

    expect(tokens).toEqual([
      {
        ...testTokens2[0],
        address:
          "0x3cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed928945c3",
      },
      {
        ...testTokens2[1],
        address:
          "0x3cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed928945c4",
      },
    ])
  })

  it("should sanitize addresses on bulkPut", async () => {
    await db.tokens.bulkPut(testTokens2)

    const tokens = await db.tokens.toArray()

    expect(tokens).toEqual([
      {
        ...testTokens2[0],
        address:
          "0x3cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed928945c3",
      },
      {
        ...testTokens2[1],
        address:
          "0x3cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed928945c4",
      },
    ])
  })
})
