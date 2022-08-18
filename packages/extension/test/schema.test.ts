import { expect, test } from "vitest"

import backupSchema from "../src/background/schema/backup.schema"
import { Wallet } from "../src/background/wallet"
import backupWrong from "./backup_wrong.mock.json"
import backupEthers from "./backup-ethers.mock.json"
import backup from "./backup.mock.json"

const backupString = JSON.stringify(backup)
const backupEthersString = JSON.stringify(backupEthers)
const backupWrongString = JSON.stringify(backupWrong)

test("schema validation should succeed", async () => {
  backupSchema.validateSync(backupEthers)
  const isValid = Wallet.validateBackup(backupString)
  expect(isValid).toBe(true)
})

test("schema validation should succeed", async () => {
  const isValid = Wallet.validateBackup(backupEthersString)
  expect(isValid).toBe(true)
})

test("schema validation should fail", async () => {
  const isValid = Wallet.validateBackup(backupWrongString)
  expect(isValid).toBe(false)
})
