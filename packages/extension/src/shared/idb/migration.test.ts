import "fake-indexeddb/auto"

import type { Hex } from "@argent/x-shared"
import { afterEach, describe, it, vi } from "vitest"
import type { Token } from "../token/__new/types/token.model"
import { ArgentDatabase } from "./db" // Adjust the import path as needed
import type { DbTokensInfoResponse } from "../token/__new/types/tokenInfo.model"
import { equalToken } from "../token/__new/utils"
import { tokensInfo } from "../defiDecomposition/__fixtures__/tokensInfo"
import { tokenPrices } from "../defiDecomposition/__fixtures__/tokenPrices"
import { tokens } from "../defiDecomposition/__fixtures__/tokens"
import { parseDefiDecomposition } from "../defiDecomposition/helpers/parseDefiDecomposition"
import { defiDecomposition } from "../defiDecomposition/__fixtures__/defiDecomposition"
import { getMockAccount } from "../../../test/account.mock"
import type { AccountInvestments } from "../investments/types"

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

const mockTokens: Token[] = [
  {
    address:
      "0x3cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed928945c1",
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
      "0x3cea9c0644433dab0c431d63a8e0e51741f93afaafc3b1d81e193ed928945c2",
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
    tags: ["Governance", "scam"],
  },
]

const mockTokenPrices = [
  {
    pricingId: 1,
    ethValue: "1",
    ccyValue: "2611.09",
    ethDayChange: "0",
    ccyDayChange: "-0.021263",
    networkId: "sepholia-alpha",
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7" as Hex,
  },
  {
    pricingId: 1,
    ethValue: "1",
    ccyValue: "2611.09",
    ethDayChange: "0",
    ccyDayChange: "-0.021263",
    networkId: "sepholia-alpha",
    address:
      "0x057146f6409deb4c9fa12866915dd952aa07c1eb2752e451d7f3b042086bdeb8" as Hex,
  },
  {
    pricingId: 1,
    ethValue: "1",
    ccyValue: "2551.657296",
    ethDayChange: "0",
    ccyDayChange: "0.022293",
    networkId: "sepholia-alpha",
    address:
      "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7" as Hex,
  },
  {
    pricingId: 1,
    ethValue: "1",
    ccyValue: "2551.657296",
    ethDayChange: "0",
    ccyDayChange: "0.022293",
    networkId: "sepholia-alpha",
    address:
      "0x57146f6409deb4c9fa12866915dd952aa07c1eb2752e451d7f3b042086bdeb8" as Hex,
  },
]

const mockTokenInfo: DbTokensInfoResponse[] = [
  {
    id: 5,
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7" as Hex,
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    sendable: true,
    popular: true,
    refundable: false,
    listed: true,
    tradable: true,
    category: "tokens",
    pricingId: 4154,
    networkId: "sepholia-alpha",
    updatedAt: 1724097597360,
  },
  {
    id: 5,
    address:
      "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7" as Hex,
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    sendable: true,
    popular: true,
    refundable: false,
    listed: true,
    tradable: true,
    category: "tokens",
    pricingId: 4154,
    networkId: "sepholia-alpha",
    updatedAt: 1724097597360,
  },
  {
    id: 15,
    address:
      "0x057146f6409deb4c9fa12866915dd952aa07c1eb2752e451d7f3b042086bdeb8" as Hex,
    category: "tokens",
    decimals: 18,
    listed: true,
    name: "Nostra ETH Interest Collat.",
    popular: false,
    pricingId: 1,
    refundable: false,
    sendable: true,
    symbol: "iETH-c",
    tradable: false,
    networkId: "sepholia-alpha",
    updatedAt: 1724097597360,
  },
  {
    id: 15,
    address:
      "0x57146f6409deb4c9fa12866915dd952aa07c1eb2752e451d7f3b042086bdeb8" as Hex,
    category: "tokens",
    decimals: 18,
    listed: true,
    name: "Nostra ETH Interest Collat.",
    popular: false,
    pricingId: 1,
    refundable: false,
    sendable: true,
    symbol: "iETH-c",
    tradable: false,
    networkId: "sepholia-alpha",
    updatedAt: 1724097597360,
  },
]

describe("migrate ArgentDatabase", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("from version 2 to version 3", async () => {
    let db = new ArgentDatabase({
      version: 2,
      skipAddressNormalizer: true,
      skipHideScamTokens: true,
    })

    await db.tokenBalances.bulkAdd(mockTokensWithBalance)

    db.close()
    db = new ArgentDatabase({ version: 3 })
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

  it("from version 3 to version 4", async () => {
    let db = new ArgentDatabase({
      version: 3,
    })
    await db.tokens.bulkAdd(mockTokens)

    await db.close()
    db = new ArgentDatabase({ version: 4 })
    await db.open()

    const tokens = await db.tokens.toArray()
    const filteredTokens = tokens.filter(
      (t) => equalToken(t, mockTokens[0]) || equalToken(t, mockTokens[1]),
    )

    expect(filteredTokens).toEqual([
      {
        ...mockTokens[0],
      },
      {
        ...mockTokens[1],
        hidden: true,
      },
    ])
  })

  it("from version 4 to version 5", async () => {
    let db = new ArgentDatabase({ version: 4, skipAddressNormalizer: true })

    await db.tokenPrices.bulkAdd(mockTokenPrices)
    await db.tokensInfo.bulkAdd(mockTokenInfo)

    await db.close()
    db = new ArgentDatabase({ version: 5 })
    await db.open()

    const tokenPrices = await db.tokenPrices.toArray()

    expect(tokenPrices.length).toBe(2)
    expect(tokenPrices[0]).toEqual({
      pricingId: 1,
      ethValue: "1",
      ccyValue: "2611.09",
      ethDayChange: "0",
      ccyDayChange: "-0.021263",
      networkId: "sepholia-alpha",
      address:
        "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    })
    expect(tokenPrices[1]).toEqual({
      pricingId: 1,
      ethValue: "1",
      ccyValue: "2611.09",
      ethDayChange: "0",
      ccyDayChange: "-0.021263",
      networkId: "sepholia-alpha",
      address:
        "0x57146f6409deb4c9fa12866915dd952aa07c1eb2752e451d7f3b042086bdeb8",
    })

    const tokensInfo = await db.tokensInfo.toArray()

    expect(tokensInfo.length).toBe(2)
    expect(tokensInfo[0]).toEqual({
      id: 5,
      address:
        "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      sendable: true,
      popular: true,
      refundable: false,
      listed: true,
      tradable: true,
      category: "tokens",
      pricingId: 4154,
      networkId: "sepholia-alpha",
      updatedAt: 1724097597360,
    })
    expect(tokensInfo[1]).toEqual({
      id: 15,
      address:
        "0x57146f6409deb4c9fa12866915dd952aa07c1eb2752e451d7f3b042086bdeb8",
      category: "tokens",
      decimals: 18,
      listed: true,
      name: "Nostra ETH Interest Collat.",
      popular: false,
      pricingId: 1,
      refundable: false,
      sendable: true,
      symbol: "iETH-c",
      tradable: false,
      networkId: "sepholia-alpha",
      updatedAt: 1724097597360,
    })
  })

  it("from version 5 to version 6", async () => {
    let db = new ArgentDatabase({ version: 5 })

    const strkOnLocalHost = {
      id: 2,
      address:
        "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
      name: "Starknet",
      symbol: "STRK",
      decimals: 18,
      network: "localhost",
      networkId: "localhost",
      iconUrl: "https://dv3jj1unlp2jl.cloudfront.net/128/color/strk.png",
      showAlways: true,
    }

    db.close()
    db = new ArgentDatabase({ version: 6 })
    await db.open()

    const tokens = await db.tokens.toArray()

    expect(tokens).toContainEqual({
      address:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      networkId: "sepolia-alpha",
      network: "sepolia-alpha",
      iconUrl: "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      id: 1,
      showAlways: true,
    })

    expect(tokens).toContainEqual(strkOnLocalHost)
  })

  it("from version 6 to version 7", async () => {
    let db = new ArgentDatabase({ version: 6, skipAddressNormalizer: true })

    await db.tokensInfo.bulkPut(tokensInfo)
    await db.tokenPrices.bulkPut(tokenPrices)
    await db.tokens.bulkPut(tokens)

    db.close()
    db = new ArgentDatabase({ version: 7, skipAddressNormalizer: true })
    await db.open()

    const mockAccount = getMockAccount({
      address: "0x123",
      networkId: "sepolia-alpha",
    })

    const dbTokensInfo = await db.tokensInfo.toArray()

    const result = parseDefiDecomposition(
      defiDecomposition,
      mockAccount,
      dbTokensInfo,
    )

    const mockInvestments: AccountInvestments = {
      address: "0x123",
      networkId: "sepolia-alpha",
      defiDecomposition: result,
    }
    await db.investments.add(mockInvestments)

    const investments = await db.investments.toArray()

    expect(investments[0]).toEqual(mockInvestments)
  })
})
