import { stripAddressZeroPadding } from "@argent/x-shared"
import type { Dexie, Transaction } from "dexie"
import type { Token } from "../token/__new/types/token.model"
import type { BaseTokenWithBalance } from "../token/__new/types/tokenBalance.model"
import { parsedDefaultTokens } from "../token/__new/utils"
import { deduplicateTable } from "./utils/deduplicateTable"
import { mergeTokensWithDefaults } from "../token/__new/repository/mergeTokens"

export interface DexieSchema {
  schema: Record<string, string>
  upgrade?: (transaction: Transaction, database?: Dexie) => Promise<void>
  populate?: (transaction: Transaction, database?: Dexie) => Promise<void>
  version: number
}

export class StorageSchema {
  static get OBJECT_STORE() {
    return {
      TOKENS: "tokens",
      TOKEN_BALANCES: "token_balances",
      TOKENS_INFO: "tokens_info",
      TOKEN_PRICES: "token_prices",

      INVESTMENTS: "investments",
    } as const
  }

  // DEV NOTE: Don’t declare all columns like in SQL. You only declare properties you want to index, that is properties you want to use in a where(…) query.
  // (See https://dexie.org/docs/API-Reference#quick-reference)
  static get schema(): DexieSchema[] {
    return [
      {
        schema: {
          [StorageSchema.OBJECT_STORE.TOKENS_INFO]:
            "[address+networkId], id, networkId, address, name, symbol, decimals, iconUrl, sendable, popular, refundable, listed, tradable, category, pricingId, updatedAt",
          [StorageSchema.OBJECT_STORE.TOKEN_PRICES]:
            "[address+networkId], address, networkId, pricingId, ethValue, ccyValue, ethDayChange, ccyDayChange",
          [StorageSchema.OBJECT_STORE.TOKEN_BALANCES]:
            "[address+networkId+account], address, networkId, account, balance",
          [StorageSchema.OBJECT_STORE.TOKENS]:
            "[address+networkId], id, iconUrl, showAlways, popular, custom, pricingId, tradable, address, networkId, name, symbol, decimals",
        },
        upgrade: async (transaction: Transaction) => {
          const tokensInfo = transaction.table(
            StorageSchema.OBJECT_STORE.TOKENS_INFO,
          )
          await tokensInfo.toCollection().modify((token) => {
            token.updatedAt = Date.now()
          })

          const tokens = transaction.table(StorageSchema.OBJECT_STORE.TOKENS)
          await tokens.bulkAdd(parsedDefaultTokens)
        },
        populate: async (transaction: Transaction) => {
          const tokensInfo = transaction.table(
            StorageSchema.OBJECT_STORE.TOKENS_INFO,
          )
          await tokensInfo.toCollection().modify((token) => {
            token.updatedAt = Date.now()
          })

          const tokens = transaction.table(StorageSchema.OBJECT_STORE.TOKENS)
          await tokens.bulkAdd(parsedDefaultTokens)
        },
        version: 1,
      },
      {
        /** version 2 - adds tags[] - array of strings for filtering tokens with "scam" tag */
        schema: {
          [StorageSchema.OBJECT_STORE.TOKENS_INFO]:
            "[address+networkId], id, networkId, address, name, symbol, decimals, iconUrl, sendable, popular, refundable, listed, tradable, category, pricingId, updatedAt, *tags",
          [StorageSchema.OBJECT_STORE.TOKENS]:
            "[address+networkId], id, iconUrl, showAlways, popular, custom, pricingId, tradable, address, networkId, name, symbol, decimals, *tags",
        },
        version: 2,
      },
      {
        schema: {
          [StorageSchema.OBJECT_STORE.TOKEN_BALANCES]:
            "[address+networkId+account], address, networkId, account, balance",
        },
        upgrade: async (transaction: Transaction) => {
          const tokenBalances = transaction.table(
            StorageSchema.OBJECT_STORE.TOKEN_BALANCES,
          )
          const tokens = transaction.table(StorageSchema.OBJECT_STORE.TOKENS)
          await deduplicateTable(
            tokenBalances,
            (item: BaseTokenWithBalance) =>
              `${stripAddressZeroPadding(item.address)}-${item.networkId}-${stripAddressZeroPadding(item.account)}`,
          )
          await deduplicateTable(
            tokens,
            (item: BaseTokenWithBalance) =>
              `${stripAddressZeroPadding(item.address)}-${item.networkId}`,
          )
        },
        version: 3,
      },
      {
        schema: {
          [StorageSchema.OBJECT_STORE.TOKENS]:
            "[address+networkId], id, iconUrl, showAlways, popular, custom, pricingId, tradable, address, networkId, name, symbol, decimals, *tags, hidden",
        },
        upgrade: async (transaction: Transaction) => {
          const table = transaction.table(StorageSchema.OBJECT_STORE.TOKENS)
          const tokensList: Token[] = await table.toArray()
          const updatedTokens = tokensList
            .filter((token) => token.tags?.includes("scam"))
            .map((token) => ({
              ...token,
              hidden: true,
            }))

          await table.bulkPut(updatedTokens)
        },
        version: 4,
      },
      {
        schema: {
          [StorageSchema.OBJECT_STORE.TOKEN_PRICES]:
            "[address+networkId], address, networkId, pricingId, ethValue, ccyValue, ethDayChange, ccyDayChange",
        },
        upgrade: async (transaction: Transaction) => {
          const tokenPrices = transaction.table(
            StorageSchema.OBJECT_STORE.TOKEN_PRICES,
          )
          await deduplicateTable(
            tokenPrices,
            (item: BaseTokenWithBalance) =>
              `${stripAddressZeroPadding(item.address)}-${item.networkId}`,
          )

          const tokensInfo = transaction.table(
            StorageSchema.OBJECT_STORE.TOKENS_INFO,
          )
          await deduplicateTable(
            tokensInfo,
            (item: BaseTokenWithBalance) =>
              `${stripAddressZeroPadding(item.address)}-${item.networkId}`,
          )
        },
        version: 5,
      },
      {
        schema: {
          [StorageSchema.OBJECT_STORE.TOKENS]:
            "[address+networkId], id, iconUrl, showAlways, popular, custom, pricingId, tradable, address, networkId, name, symbol, decimals, *tags, hidden",
        },
        upgrade: async (transaction: Transaction) => {
          const tokens = transaction.table(StorageSchema.OBJECT_STORE.TOKENS)

          const mergedWithNewDefaultTokens = mergeTokensWithDefaults(
            await tokens.toArray(),
          )

          await tokens.bulkPut(mergedWithNewDefaultTokens)
        },
        version: 6,
      },
      {
        schema: {
          [StorageSchema.OBJECT_STORE.INVESTMENTS]: "[address+networkId]",
        },
        version: 7,
      },
    ]
  }
}
