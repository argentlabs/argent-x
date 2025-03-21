import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"

const strkInitialBalance = "2.1"

test.describe("Address Book", { tag: "@tx" }, () => {
  test.skip(config.skipTXTests === "true")
  test("Add, update, use and delete address", async ({ extension }) => {
    await extension.setupWallet({
      accountsToSetup: [
        { assets: [{ token: "STRK", balance: strkInitialBalance }] },
      ],
    })

    await extension.account.send.click()
    await extension.addressBook.addressBook.click()
    //create
    await extension.addressBook.add.click()
    await extension.addressBook.saveLocator.click()
    await expect(extension.addressBook.nameRequired).toBeVisible()
    await expect(extension.addressBook.addressRequired).toBeVisible()
    await extension.addressBook.name.fill("My first address")
    await extension.addressBook.saveLocator.click()
    await expect(extension.addressBook.nameRequired).not.toBeVisible()
    await expect(extension.addressBook.addressRequired).toBeVisible()
    await extension.addressBook.address.fill(config.account1Seed2!)
    await expect(extension.addressBook.nameRequired).not.toBeVisible()
    await expect(extension.addressBook.addressRequired).not.toBeVisible()
    await extension.addressBook.network.click()
    await extension.addressBook.saveLocator.click()
    // update
    await extension.addressBook.editAddress("My first address")
    await extension.addressBook.name.fill("New name")
    await extension.addressBook.saveLocator.click()
    await expect(extension.addressBook.addressByName("New name")).toBeVisible()
    await extension.navigation.backLocator.click()

    //transfer to address
    await extension.account.send.click()
    await extension.addressBook.addressBook.click()
    await extension.addressBook.addressByName("New name").click()
    await extension.account.selectTokenButton.click()
    await extension.account.token("STRK").click()
    await extension.account.sendMax.click()
    await extension.navigation.reviewSendLocator.click()
    await extension.account.confirmTransaction()

    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx({
      txHash: txHash!,
      receiver: config.account1Seed2!,
    })

    //delete address
    await extension.navigation.menuTokensLocator.click()
    await extension.account.send.click()
    await extension.addressBook.addressBook.click()

    await extension.addressBook.editAddress("New name")
    await extension.addressBook.deleteAddress.click()
    await extension.addressBook.delete.click()
    await expect(
      extension.addressBook.addressByName("New name"),
    ).not.toBeVisible()
  })

  test("Add address after typing", async ({ extension }) => {
    await extension.setupWallet({
      accountsToSetup: [
        { assets: [{ token: "STRK", balance: strkInitialBalance }] },
      ],
    })

    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectDefaultNetwork()

    await extension.account.send.click()
    await extension.account.recipientAddressQuery.type(config.account1Seed2!)
    await extension.addressBook.add.click()
    await expect(extension.addressBook.address).toHaveText(
      config.account1Seed2!,
    )
    await extension.addressBook.name.fill("My address")
    await extension.addressBook.saveLocator.click()
    await extension.account.contact("My address").click()
    await extension.account.selectTokenButton.click()
    await extension.account.token("STRK").click()
    await extension.account.sendMax.click()
    await extension.navigation.reviewSendLocator.click()
    await extension.account.confirmTransaction()
    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx({
      txHash: txHash!,
      receiver: config.account1Seed2!,
    })
  })

  test("Add address from send window", async ({ extension }) => {
    await extension.setupWallet({
      accountsToSetup: [
        { assets: [{ token: "STRK", balance: strkInitialBalance }] },
      ],
    })

    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectDefaultNetwork()

    await extension.account.send.click()
    await extension.account.recipientAddressQuery.focus()
    await extension.account.recipientAddressQuery.fill(config.account1Seed2!)
    await extension.account.recipientAddressQuery.press("Enter")

    await extension.account.saveAddress.click()
    await expect(extension.addressBook.address).toHaveText(
      config.account1Seed2!,
    )
    await extension.addressBook.name.fill("My address")
    await extension.addressBook.saveLocator.click()
    await extension.account.selectTokenButton.click()
    await extension.account.token("STRK").click()
    await expect(extension.account.sendMax).toBeVisible()
    await expect(extension.account.reviewSendLocator).toBeVisible()
    await expect(extension.navigation.closeLocator).toHaveCount(1)

    await extension.account.sendMax.click()
    await extension.navigation.reviewSendLocator.click()
    await extension.account.confirmTransaction()

    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx({
      txHash: txHash!,
      receiver: config.account1Seed2!,
    })
  })

  test("Add address - starknet.id", async ({ extension }) => {
    await extension.setupWallet({
      accountsToSetup: [
        { assets: [{ token: "STRK", balance: strkInitialBalance }] },
      ],
    })

    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectDefaultNetwork()

    await extension.account.send.click()
    await extension.account.recipientAddressQuery.type("qateste2e.stark")
    await extension.addressBook.add.click()
    await expect(extension.addressBook.address).toHaveText("qateste2e.stark")
    await extension.addressBook.name.fill("My address")
    await extension.addressBook.saveLocator.click()
    await extension.account.contact("My address").click()
    await extension.account.selectTokenButton.click()
    await extension.account.token("STRK").click()
    await extension.account.sendMax.click()
    await extension.navigation.reviewSendLocator.click()
    await extension.account.confirmTransaction()
    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx({
      txHash: txHash!,
      receiver: config.senderAddrs![0],
    })
  })
})
