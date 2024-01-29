import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"

test.describe("Address Book", () => {
  test("Add, update, use and delete address", async ({ extension }) => {
    await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.002 }],
    })

    await extension.navigation.showSettings.click()
    await extension.settings.addressBook.click()
    //create
    await extension.addressBook.add.click()
    await extension.addressBook.save.click()
    await expect(extension.addressBook.nameRequired).toBeVisible()
    await expect(extension.addressBook.addressRequired).toBeVisible()
    await extension.addressBook.name.fill("My first address")
    await extension.addressBook.save.click()
    await expect(extension.addressBook.nameRequired).not.toBeVisible()
    await expect(extension.addressBook.addressRequired).toBeVisible()
    await extension.addressBook.address.fill(config.account1Seed2!)
    await expect(extension.addressBook.nameRequired).not.toBeVisible()
    await expect(extension.addressBook.addressRequired).not.toBeVisible()
    await extension.addressBook.network.click()
    await extension.addressBook.networkOption("Testnet").click()
    await extension.addressBook.save.click()

    // update
    await extension.addressBook.addressByName("My first address").click()
    await extension.addressBook.name.fill("New name")
    await extension.addressBook.save.click()
    await expect(extension.addressBook.addressByName("New name")).toBeVisible()
    await extension.navigation.back.click()
    await extension.navigation.close.click()

    //transfer to address
    await extension.account.token("Ethereum").click()
    await extension.addressBook.addressBook.click()
    await extension.addressBook.addressByName("New name").click()
    await extension.account.sendMax.click()
    await extension.navigation.reviewSend.click()
    await extension.navigation.confirm.click()

    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx(txHash!, config.account1Seed2!)

    //delete address
    await extension.navigation.menuTokens.click()
    await extension.navigation.showSettings.click()
    await extension.settings.addressBook.click()
    await extension.addressBook.addressByName("New name").click()
    await extension.addressBook.deleteAddress.click()
    await extension.addressBook.delete.click()
    await expect(
      extension.addressBook.addressByName("New name"),
    ).not.toBeVisible()
  })

  test("Add address after typing", async ({ extension }) => {
    await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.002 }],
    })

    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Testnet")

    await extension.account.token("Ethereum").click()
    await extension.account.recipientAddressQuery.type(config.account1Seed2!)
    await extension.addressBook.add.click()
    await expect(extension.addressBook.address).toHaveText(
      config.account1Seed2!,
    )
    await extension.addressBook.name.fill("My address")
    await extension.addressBook.save.click()
    await extension.account.contact("My address").click()

    await extension.account.sendMax.click()
    await extension.navigation.reviewSend.click()
    await extension.navigation.confirm.click()
    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx(txHash!, config.account1Seed2!)
  })

  test("Add address from send window", async ({ extension }) => {
    await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.002 }],
    })

    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Testnet")

    await extension.account.token("Ethereum").click()
    await extension.setClipBoardContent(config.account1Seed2!)
    await extension.account.recipientAddressQuery.focus()
    await extension.paste()

    await extension.account.saveAddress.click()
    await expect(extension.addressBook.address).toHaveText(
      config.account1Seed2!,
    )
    await extension.addressBook.name.fill("My address")
    await extension.addressBook.save.click()

    await extension.account.sendMax.click()
    await extension.navigation.reviewSend.click()
    await extension.navigation.confirm.click()

    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx(txHash!, config.account1Seed2!)
  })
})
