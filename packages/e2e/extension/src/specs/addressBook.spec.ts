import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"

test.describe("Address Book", () => {
  test("Add, update, use and delete address", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Localhost 5050")
    await extension.account.addAccount({})
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
    await extension.addressBook.address.fill(config.wallets[0].accounts![0])
    await expect(extension.addressBook.nameRequired).not.toBeVisible()
    await expect(extension.addressBook.addressRequired).not.toBeVisible()
    await extension.addressBook.network.click()
    await extension.addressBook.networkOption("Localhost 5050").click()
    await extension.addressBook.save.click()

    // update
    await extension.addressBook.addressByname("My first address").click()
    await extension.addressBook.name.fill("New name")
    await extension.addressBook.save.click()
    await expect(extension.addressBook.addressByname("New name")).toBeVisible()
    await extension.navigation.back.click()
    await extension.navigation.close.click()

    //transfer to address
    await extension.account.token("Ethereum").click()
    await extension.account.send.click()
    await extension.account.recipientAddress.click()
    await extension.addressBook.addressByname("New name").click()
    await extension.account.sendMax.click()
    await extension.navigation.next.click()
    await extension.navigation.approve.click()
    await extension.activity.checkActivity(1)

    //delete address
    await extension.navigation.menuTokens.click()
    await extension.navigation.showSettings.click()
    await extension.settings.addressBook.click()
    await extension.addressBook.addressByname("New name").click()
    await extension.addressBook.deleteAddress.click()
    await extension.addressBook.delete.click()
    await expect(
      extension.addressBook.addressByname("New name"),
    ).not.toBeVisible()
  })

  test("Add address from send window", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Localhost 5050")
    await extension.account.addAccount({})

    await extension.account.token("Ethereum").click()
    await extension.account.send.click()
    await extension.account.recepientAddress.fill(
      config.wallets[0].accounts![0],
    )
    await extension.account.saveAddress.click()
    await expect(extension.addressBook.address).toHaveText(
      config.wallets[0].accounts![0],
    )
    await extension.addressBook.name.fill("My address")
    await extension.addressBook.save.click()
    await expect(extension.account.contact).toHaveText("My address")

    await extension.account.sendMax.click()
    await extension.navigation.next.click()
    await extension.navigation.approve.click()
    await extension.activity.checkActivity(1)
  })
})
