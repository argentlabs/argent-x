import { isBoolean, isPlainObject } from "lodash-es"
import browser from "webextension-polyfill"

import { WalletBackupService } from "../../background/wallet/backup/backup.service"
import { old_walletStore } from "../../shared/wallet/walletStore"
import { migrateWalletAccounts } from "../account/storeMigration"

/** TODO: refactor and check - This method is called for every message at the beginning of `handleMessage` */

export async function migrateWallet() {
  await Promise.allSettled([
    migrateBackup(),
    migrateDiscoveredOnce(),
    migrateSelected(),
    migrateWalletAccounts(),
  ])
}

export async function migrateBackup() {
  try {
    const needsMigration = (await browser.storage.local.get("wallet:backup"))[
      "wallet:backup"
    ]

    if (!needsMigration) {
      return
    }

    const oldWallet = JSON.parse(needsMigration)
    if (!WalletBackupService.validateBackup(oldWallet)) {
      throw new Error("Invalid backup")
    }
    await old_walletStore.set("backup", oldWallet)
    return browser.storage.local.remove("wallet:backup")
  } catch (e) {
    console.log(e)
  }
}

export async function migrateDiscoveredOnce() {
  try {
    const needsMigration = (
      await browser.storage.local.get("wallet:discoveredOnce")
    )["wallet:discoveredOnce"]

    if (!needsMigration) {
      return
    }

    const oldDiscoveredOnce = JSON.parse(needsMigration)
    if (!isBoolean(oldDiscoveredOnce)) {
      throw new Error("Invalid discoveredOnce")
    }
    await old_walletStore.set("discoveredOnce", oldDiscoveredOnce)
    return browser.storage.local.remove("wallet:discoveredOnce")
  } catch (e) {
    console.log(e)
  }
}

export async function migrateSelected() {
  try {
    const needsMigration = (await browser.storage.local.get("wallet:selected"))[
      "wallet:selected"
    ]

    if (!needsMigration) {
      return
    }

    const oldSelected = JSON.parse(needsMigration)
    if (
      !isPlainObject(oldSelected) ||
      !oldSelected.address ||
      !oldSelected.networkId
    ) {
      throw new Error("Invalid selected")
    }
    await old_walletStore.set("selected", oldSelected)
    return browser.storage.local.remove("wallet:selected")
  } catch (e) {
    console.log(e)
  }
}
