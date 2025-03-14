import urlJoin from "url-join"

import { networkService as argentNetworkService } from "../network/service"

import type { BaseWalletAccount } from "../wallet.model"
import type { INetworkService } from "../network/service/INetworkService"
import type { FRI, WEI } from "@argent/x-shared"

export const tryToMintFeeToken = async (
  account: BaseWalletAccount,
  networkService?: Pick<INetworkService, "getById">, // This is required for testing
  unit?: WEI | FRI,
) => {
  try {
    if (!unit) {
      throw new Error("Minting Unit is required")
    }

    if (account.networkId !== "localhost") {
      return false
    }

    const network = await (networkService || argentNetworkService).getById(
      account.networkId,
    )
    const networkUrl = network.rpcUrl
    const res = await fetch(urlJoin(networkUrl, "mint"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: account.address.toLowerCase().replace("0x0", "0x"),
        amount: 10e18,
        unit,
      }),
    })

    return res.ok
  } catch (e) {
    console.warn("Failed to mint fee token", e)
    return false
  }
}

export const tryToMintETH = async (
  account: BaseWalletAccount,
  networkService?: Pick<INetworkService, "getById">,
) => {
  return tryToMintFeeToken(account, networkService, "WEI")
}

export const tryToMintSTRK = async (
  account: BaseWalletAccount,
  networkService?: Pick<INetworkService, "getById">,
) => {
  return tryToMintFeeToken(account, networkService, "FRI")
}

export const tryToMintAllFeeTokens = async (
  account: BaseWalletAccount,
  networkService?: Pick<INetworkService, "getById">,
) => {
  return Promise.all([
    tryToMintETH(account, networkService),
    tryToMintSTRK(account, networkService),
  ])
}
