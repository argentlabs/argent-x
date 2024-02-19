import test from "../test"
import config from "../../../shared/config"

test.describe(`Dapps`, () => {
  test("Create wallet from Dapp", async ({ webWallet, browserContext }) => {
    const email = webWallet.generateEmail()
    const credentials = {
      email,
      pin: config.validLogin.pin,
      password: config.validLogin.password,
    }

    await webWallet.dapps.requestConnectionFromDapp({
      browserContext,
      dappUrl: "https://dapp-argentlabs.vercel.app",
      credentials,
      newAccount: true,
    })
    await webWallet.login.success(credentials)
  })

  test("Connect from Dapp", async ({ webWallet, browserContext }) => {
    await webWallet.dapps.requestConnectionFromDapp({
      browserContext,
      dappUrl: "https://dapp-argentlabs.vercel.app",
      credentials: config.validLogin,
      newAccount: false,
    })
  })
})
