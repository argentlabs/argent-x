import { Dexie, Table } from "dexie"
import type { Token } from "../token/__new/types/token.model"
import type { BaseTokenWithBalance } from "../token/__new/types/tokenBalance.model"
import { DbTokensInfoResponse } from "../token/__new/types/tokenInfo.model"
import { TokenPriceDetails } from "../token/__new/types/tokenPrice.model"
import { DexieSchema, StorageSchema } from "./schema"
import { noop } from "lodash-es"
import { equalToken, parsedDefaultTokens } from "../token/__new/utils"
import { mergeTokens } from "../token/__new/repository/mergeTokens"
import logger from "dexie-logger"
import { isFeatureEnabled } from "@argent/x-shared"
import addressNormalizerMiddleware from "./addressNormalizerMiddleware"

interface ArgentDatabaseConfig {
  version?: number
  skipAddressNormalizer?: boolean
}

export class ArgentDatabase extends Dexie {
  tokens: Table<Token, string>
  tokenBalances: Table<BaseTokenWithBalance, string>
  tokensInfo: Table<DbTokensInfoResponse, number>
  tokenPrices: Table<TokenPriceDetails, [string, string]>
  _config?: ArgentDatabaseConfig

  constructor(config?: ArgentDatabaseConfig) {
    super("Argent")
    this._config = config
    this.initialiseDatabase()

    this.tokens = this.table(StorageSchema.OBJECT_STORE.TOKENS)
    this.tokenBalances = this.table(StorageSchema.OBJECT_STORE.TOKEN_BALANCES)
    this.tokensInfo = this.table(StorageSchema.OBJECT_STORE.TOKENS_INFO)
    this.tokenPrices = this.table(StorageSchema.OBJECT_STORE.TOKEN_PRICES)

    this.registerHooks()
  }

  private initialiseDatabase() {
    let upgrades: DexieSchema[] = StorageSchema.schema

    if (this._config && this._config.version) {
      upgrades = upgrades.filter(
        (upgrade) => upgrade.version <= (this._config?.version || 0),
      )
    }

    for (const { schema, version, upgrade, populate } of upgrades) {
      const upgradeCallback = upgrade || noop
      const populateCallback = populate || noop
      this.version(version).stores(schema).upgrade(upgradeCallback)
      this.on("populate", populateCallback)
    }
  }

  private registerHooks() {
    this.tokens.hook("reading", (token) => {
      const defaultToken = parsedDefaultTokens.find((t) => equalToken(token, t))

      if (!defaultToken) {
        return token
      }

      return mergeTokens(token, defaultToken)
    })

    if (isFeatureEnabled(process.env.USE_INDEXDB_LOGGER)) {
      this.use(logger())
    }

    if (!this._config?.skipAddressNormalizer) {
      this.use(addressNormalizerMiddleware())
    }
  }

  public async clear() {
    await this.delete()
    await this.open()
  }
}

export const argentDb = new ArgentDatabase()
