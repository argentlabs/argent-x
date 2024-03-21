import test from "../test"

test.describe(`Assets page`, () => {
  test("Assets page has loaded", async ({ webWallet }) => {
    await webWallet.login.success()
    await webWallet.assets.assetPageHasLoaded()
  })
})
