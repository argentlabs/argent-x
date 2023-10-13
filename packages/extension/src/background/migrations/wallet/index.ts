import { cryptoStarknetService } from "../../walletSingleton"
import { accountRepo } from "../../../shared/account/store"
import { walletStore } from "../../../shared/wallet/walletStore"
import { determineMigrationNeededV581, migrateAccountsV581 } from "./v5.8.1"
import { migrateTestnet2Accounts } from "./testnet2Accounts"

export async function runV581Migration() {
  const accountsToMigrate = await determineMigrationNeededV581(
    cryptoStarknetService,
    accountRepo,
  )
  await migrateAccountsV581(accountsToMigrate, accountRepo, walletStore)
}

export async function runRemoveTestnet2Accounts() {
  await migrateTestnet2Accounts(accountRepo, walletStore)
}
