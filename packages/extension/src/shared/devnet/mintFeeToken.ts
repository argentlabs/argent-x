import urlJoin from "url-join"

import { getNetwork } from "../network"
import { BaseWalletAccount } from "../wallet.model"

export const tryToMintFeeToken = async (account: BaseWalletAccount) => {
  try {
    const network = await getNetwork(account.networkId)
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
    return true
  } catch (e) {
    console.warn("Failed to mint fee token", e)
    return false
  }
}
