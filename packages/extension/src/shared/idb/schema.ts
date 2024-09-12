import type { Dexie, Transaction } from "dexie"
import { parsedDefaultTokens } from "../token/__new/utils"
import { stripAddressZeroPadding } from "@argent/x-shared"
import { BaseTokenWithBalance } from "../token/__new/types/tokenBalance.model"
import { sanitizeRecord } from "./addressNormalizerMiddleware"

export const deduplicateTable = async <T>(
  table: Dexie.Table,
  getPrimaryKey: (item: T) => string,
) => {
  const allItems = await table.toArray()
  const uniqueItems = new Map()

  allItems.forEach((item) => {
    const primaryKey = getPrimaryKey(item)
    const existingItem = uniqueItems.get(primaryKey)
    if (
      !existingItem ||
      (item.updatedAt && item.updatedAt > existingItem.updatedAt)
    ) {
      uniqueItems.set(primaryKey, item)
    }
  })
  // Clear the table
  await table.clear()
  // Add back the unique items one by one
  for (const item of uniqueItems.values()) {
    try {
      await table.add(sanitizeRecord(item))
    } catch (error) {
      console.error(`Failed to add item: ${JSON.stringify(item)}`, error)
      try {
        await table.update(getPrimaryKey(item), item)
      } catch (updateError) {
        console.error(
          `Failed to update item: ${JSON.stringify(item)}`,
          updateError,
        )
      }
    }
  }
}
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
    } as const
  }

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
    ]
  }
}
