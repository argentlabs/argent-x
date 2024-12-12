import type { CairoVersion } from "starknet"
import { shortString } from "starknet"
import type { Network } from "../network"
import { getProvider } from "../network"
import semver from "semver"
import type { WalletAccountType } from "../wallet.model"
import { getMulticallForNetwork } from "../multicall"

export async function getAccountCairoVersion(
  accountAddress: string,
  network: Network,
  type: WalletAccountType = "standard",
): Promise<CairoVersion | undefined> {
  try {
    if (type === "multisig" || type === "smart" || type === "imported") {
      return "1" // Only Cairo version 1 is supported for multisig and smart accounts
    }

    let encodedString: string

    if (network.multicallAddress) {
      const multicall = getMulticallForNetwork(network)

      const response = await multicall.callContract({
        contractAddress: accountAddress,
        entrypoint: "getVersion",
      })

      encodedString = response[0]
    } else {
      const provider = getProvider(network)
      const response = await provider.callContract({
        contractAddress: accountAddress,
        entrypoint: "getVersion",
      })

      encodedString = response[0]
    }

    const accountContractVersion = shortString.decodeShortString(encodedString)

    if (semver.gte(accountContractVersion, "0.3.0")) {
      return "1"
    }

    return "0"
  } catch {
    return undefined
  }
}
