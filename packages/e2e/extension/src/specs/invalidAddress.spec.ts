import { expect } from "@playwright/test"
import test from "../test"
import config from "../config"

test.describe("Invalid addresses", { tag: "@all" }, () => {
  test("Invalid starknet id", async ({ extension }) => {
    await extension.open()
    await extension.recoverWallet(config.senderSeed!)
    await expect(extension.network.networkSelector).toBeVisible()

    await extension.account.token("ETH").click()
    await extension.account.fillRecipientAddress({
      recipientAddress: "e2e-test5345346eertgegeggfgdgdgdfgdgdf.stark",
      validAddress: false,
    })
    await expect(
      extension.account.invalidStarkIdError(
        "e2e-test5345346eertgegeggfgdgdgdfgdgdf.stark",
      ),
    ).toBeVisible()
  })

  test("Invalid address (short address)", async ({ extension }) => {
    await extension.open()
    await extension.recoverWallet(config.senderSeed!)
    await expect(extension.network.networkSelector).toBeVisible()

    await extension.account.token("ETH").click()
    await extension.account.fillRecipientAddress({
      recipientAddress:
        "0x0451fCcB2617Db213E0e661D525F16a52eCCF9E2b8D735f13E4F7de49A4Dc3a",
      validAddress: false,
    })
    await expect(extension.account.shortAddressError).toBeVisible()
  })

  test("Invalid address (checksum error)", async ({ extension }) => {
    await extension.open()
    await extension.recoverWallet(config.senderSeed!)
    await expect(extension.network.networkSelector).toBeVisible()

    await extension.account.token("ETH").click()
    await extension.account.fillRecipientAddress({
      recipientAddress:
        "0x0451fCcB2617Db213E0e661D525F16a52eCCF9E2b8D735f13E4F7de49A4Dc3a3",
      validAddress: false,
    })
    await expect(extension.account.invalidCheckSumError).toBeVisible()
  })

  test("Invalid address", async ({ extension }) => {
    await extension.open()
    await extension.recoverWallet(config.senderSeed!)
    await expect(extension.network.networkSelector).toBeVisible()

    await extension.account.token("ETH").click()
    await extension.account.fillRecipientAddress({
      recipientAddress:
        "0x0451fCcB2617Db213E0e661D525F16a52eCCF9E2b8D735f13E4F7de49A4Dc3aq",
      validAddress: false,
    })
    await expect(extension.account.invalidAddress).toBeVisible()
  })
})
