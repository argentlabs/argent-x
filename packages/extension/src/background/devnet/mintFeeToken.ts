import urlJoin from "url-join"

import { getNetwork } from "../../shared/network"
import { BaseWalletAccount } from "../../shared/wallet.model"
import { getDevnetStatus } from "../networkStatus"

export const tryToMintFeeToken = async (account: BaseWalletAccount) => {
  try {
    const network = await getNetwork(account.networkId)
    const isDevnet = await getDevnetStatus(network)
    if (isDevnet === "ok") {
      await fetch(urlJoin(network.baseUrl, "mint"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: account.address.toLowerCase().replace("0x0", "0x"),
          amount: 1e18,
          lite: true,
        }),
      })
    }
  } catch (e) {
    console.warn("Failed to mint fee token", e)
  }
}
