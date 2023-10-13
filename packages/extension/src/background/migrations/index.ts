import { walletSessionServiceEmitter } from "../walletSingleton"
import { Locked } from "../wallet/session/interface"
import { runRemoveTestnet2Migration } from "./network/removeTestnet2"
import { KeyValueStorage } from "../../shared/storage"
import { runRemoveTestnet2Accounts, runV581Migration } from "./wallet"
import { runV59TokenMigration } from "./token/v5.9"

enum WalletMigrations {
  v581 = "wallet:v581",
  removeTestnet2Accounts = "wallet:removeTestnet2Accounts",
}

enum NetworkMigrations {
  removeTestnet2 = "network:removeTestnet2",
}

enum TokenMigrations {
  v59 = "token:v59",
}

const migrationsStore = new KeyValueStorage(
  {
    [WalletMigrations.v581]: false,
    [WalletMigrations.removeTestnet2Accounts]: false,
    [NetworkMigrations.removeTestnet2]: false,
    [TokenMigrations.v59]: false,
  },
  "core:migrations",
)

export const migrationListener = walletSessionServiceEmitter.on(
  Locked,
  async (locked) => {
    if (!locked) {
      // TODO: come up with a better, generic mechanism for this
      const v581Migration = await migrationsStore.get(WalletMigrations.v581)
      const networkMigration = await migrationsStore.get(
        NetworkMigrations.removeTestnet2,
      )
      const removeTestnet2Accounts = await migrationsStore.get(
        WalletMigrations.removeTestnet2Accounts,
      )
      const v59Migration = await migrationsStore.get(TokenMigrations.v59)
      if (!v581Migration) {
        await runV581Migration()
        await migrationsStore.set(WalletMigrations.v581, true)
      }
      if (!removeTestnet2Accounts) {
        await runRemoveTestnet2Accounts()
        await migrationsStore.set(WalletMigrations.removeTestnet2Accounts, true)
      }
      if (!networkMigration) {
        await runRemoveTestnet2Migration()
        await migrationsStore.set(NetworkMigrations.removeTestnet2, true)
      }

      if (!v59Migration) {
        await runV59TokenMigration()
        await migrationsStore.set(TokenMigrations.v59, true)
      }
    }
  },
)
