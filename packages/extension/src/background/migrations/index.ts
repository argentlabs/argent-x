import browser from "webextension-polyfill"

import { restoreDefaultNetworks } from "./network/restoreDefaultNetworksMigration"
import { KeyValueStorage } from "../../shared/storage"
import { runRemoveTestnet2Accounts, runV581Migration } from "./wallet"
import { runV59TokenMigration } from "./token/v5.9"
import { runDefaultTokenMigration } from "./token/v5.10"
import { runPreAuthorizationMigrationOld } from "./preAuthorizations/old"
import { runLatestBalanceChangingActivityMigration } from "./activity/latestBalanceChangingActivityMigration"
import {
  migrateTxStatus,
  needsTxStatusMigration,
} from "./transactions/migrateStatus"

enum WalletMigrations {
  v581 = "wallet:v581",
  removeTestnet2Accounts = "wallet:removeTestnet2Accounts",
}

enum NetworkMigrations {
  rpcEverywhere = "network:rpcEverywhere:r2",
}

enum TokenMigrations {
  v59 = "token:v59",
  v510 = "token:v510:r3",
}

enum PreAuthorizationMigrations {
  old = "preAuthorization:old",
}

enum ActivityMigrations {
  latestBalanceChangingActivity = "activityMigrations:latestBalanceChangingActivity",
}

const migrationsStore = new KeyValueStorage(
  {
    [WalletMigrations.v581]: false,
    [WalletMigrations.removeTestnet2Accounts]: false,
    [NetworkMigrations.rpcEverywhere]: false,
    [TokenMigrations.v59]: false,
    [TokenMigrations.v510]: false,
    [PreAuthorizationMigrations.old]: false,
    [ActivityMigrations.latestBalanceChangingActivity]: false,
  },
  "core:migrations",
)

async function runInstallMigrations() {
  const preAuthorizationMigrationOld = await migrationsStore.get(
    PreAuthorizationMigrations.old,
  )
  const activityMigrationLatestBalanceChangingActivity =
    await migrationsStore.get(ActivityMigrations.latestBalanceChangingActivity)

  if (!preAuthorizationMigrationOld) {
    await runPreAuthorizationMigrationOld()
    await migrationsStore.set(PreAuthorizationMigrations.old, true)
  }

  if (!activityMigrationLatestBalanceChangingActivity) {
    await runLatestBalanceChangingActivityMigration()
    await migrationsStore.set(
      ActivityMigrations.latestBalanceChangingActivity,
      true,
    )
  }
}

async function runUpdateMigrations() {
  // TODO: come up with a better, generic mechanism for this
  const v581Migration = await migrationsStore.get(WalletMigrations.v581)
  const rpcEverywhereMigration = await migrationsStore.get(
    NetworkMigrations.rpcEverywhere,
  )
  const removeTestnet2Accounts = await migrationsStore.get(
    WalletMigrations.removeTestnet2Accounts,
  )
  const v59Migration = await migrationsStore.get(TokenMigrations.v59)
  const v510Migration = await migrationsStore.get(TokenMigrations.v510)

  if (!v581Migration) {
    await runV581Migration()
    await migrationsStore.set(WalletMigrations.v581, true)
  }
  if (!removeTestnet2Accounts) {
    await runRemoveTestnet2Accounts()
    await migrationsStore.set(WalletMigrations.removeTestnet2Accounts, true)
  }
  if (!rpcEverywhereMigration) {
    await restoreDefaultNetworks()
    await migrationsStore.set(NetworkMigrations.rpcEverywhere, true)
  }

  if (!v59Migration) {
    await runV59TokenMigration()
    await migrationsStore.set(TokenMigrations.v59, true)
  }

  if (!v510Migration) {
    await runDefaultTokenMigration()
    await migrationsStore.set(TokenMigrations.v510, true)
  }

  if (await needsTxStatusMigration()) {
    await migrateTxStatus()
  }
}

export const installMigrationListener = browser.runtime.onInstalled.addListener(
  async (details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      await runInstallMigrations()
    }
    if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
      await runUpdateMigrations()
    }
  },
)
