import urlJoin from "url-join"

import { networkService as argentNetworkService } from "../network/service"

import { BaseWalletAccount } from "../wallet.model"
import { INetworkService } from "../network/service/interface"

export const tryToMintFeeToken = async (
  account: BaseWalletAccount,
  networkService?: Pick<INetworkService, "getById">, // This is required for testing
) => {
  try {
    const network = await (networkService || argentNetworkService).getById(
      account.networkId,
    )
    const networkUrl = network.rpcUrl
    await fetch(urlJoin(networkUrl, "mint"), {
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
