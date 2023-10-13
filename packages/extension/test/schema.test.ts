import { expect, test } from "vitest"

import backupSchema from "../src/background/schema/backup.schema"

import backupWrong from "./backup_wrong.mock.json"
import backupEthers from "./backup-ethers.mock.json"
import backup from "./backup.mock.json"
import { WalletBackupService } from "../src/background/wallet/backup/backup.service"

const backupString = JSON.stringify(backup)
const backupEthersString = JSON.stringify(backupEthers)
const backupWrongString = JSON.stringify(backupWrong)

test("schema validation should succeed", async () => {
  backupSchema.parse(backupEthers)
  const isValid = WalletBackupService.validateBackup(backupString)
  expect(isValid).toBe(true)
})

test("schema validation should succeed", async () => {
  const isValid = WalletBackupService.validateBackup(backupEthersString)
  expect(isValid).toBe(true)
})

test("schema validation should fail", async () => {
  const isValid = WalletBackupService.validateBackup(backupWrongString)
  expect(isValid).toBe(false)
})
