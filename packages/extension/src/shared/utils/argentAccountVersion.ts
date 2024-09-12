import { CairoVersion, shortString } from "starknet"
import { Network, getProvider } from "../network"
import semver from "semver"
import { ArgentAccountType } from "../wallet.model"
import { getMulticallForNetwork } from "../multicall"

export async function getAccountCairoVersion(
  accountAddress: string,
  network: Network,
  type: ArgentAccountType = "standard",
): Promise<CairoVersion | undefined> {
  try {
    if (type === "multisig" || type === "smart") {
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
  } catch (e) {
    return undefined
  }
}
