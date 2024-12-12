import {
  addressSchema,
  ensureArray,
  getChainIdFromNetworkId,
  ResolveNameService,
} from "@argent/x-shared"
import type { Call } from "starknet"
import { starknetId } from "starknet"
import useSWR from "swr"

import { getMulticallForNetwork } from "../../shared/multicall"
import { networkService } from "../../shared/network/service"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import {
  argentApiHeadersForNetwork,
  argentApiNetworkForNetwork,
} from "../../shared/api/headers"
import { ARGENT_NAME_RESOLUTION_API_BASE_URL } from "../../shared/api/constants"
import { settingsStore } from "../../shared/settings"
import { useKeyValueStorage } from "../hooks/useStorage"

const BROTHER_ID_CONTRACT_ADDRESS =
  "0x0212f1c57700f5a3913dd11efba540196aad4cf67772f7090c62709dd804fa74"

export function useStarknetId(account?: BaseWalletAccount) {
  const selectedIdProvider = useKeyValueStorage(settingsStore, "idProvider")

  return useSWR(
    [account?.id, selectedIdProvider, "starknetIdv2"],
    async () => {
      if (!account) {
        return
      }

      const [brotherid, starknetid, idProvider] = await Promise.all([
        getBrotherId(account),
        getStarknetId(account),
        settingsStore.get("idProvider"),
      ])

      const ids = {
        brotherid,
        starknetid,
      }

      return ids[idProvider] || starknetid || brotherid
    },
    {
      revalidateOnMount: true,
      dedupingInterval: 1000 * 60 * 5, // 5 minutes
    },
  )
}

export const getBrotherId = async (account: BaseWalletAccount) => {
  const network = await networkService.getById(account.networkId)
  const multicall = getMulticallForNetwork(network)

  const call: Call = {
    contractAddress: BROTHER_ID_CONTRACT_ADDRESS,
    entrypoint: "getPrimary",
    calldata: [account.address],
  }

  const response = await multicall.callContract(call)
  const decimalDomain = response.map(BigInt)
  const stringDomain = starknetId
    .useDecoded(decimalDomain)
    .replace(".stark", ".brother")

  if (!stringDomain || stringDomain === ".brother") {
    return null
  }

  //  Check expiration date
  const domainDetails = await multicall.callContract({
    contractAddress: BROTHER_ID_CONTRACT_ADDRESS,
    entrypoint: "get_details_by_domain",
    calldata: response,
  })

  if (!domainDetails) {
    return null
  }

  const expiration = ensureArray(domainDetails)[4] // Expiration index

  if (!expiration) {
    return null
  }

  const currentTime = BigInt(Math.floor(Date.now() / 1000))

  if (BigInt(expiration) < currentTime) {
    return null
  }

  return stringDomain
}

export async function getStarknetId(account: BaseWalletAccount) {
  try {
    return await getStarknetIdFromBackend(account)
  } catch {
    console.warn("Failed to get StarknetId from backend, trying onchain")
    return getStarknetIdOnchain(account)
  }
}

export async function getStarknetIdFromBackend(account: BaseWalletAccount) {
  const network = await networkService.getById(account.networkId)

  if (!ARGENT_NAME_RESOLUTION_API_BASE_URL) {
    throw new Error("Argent name resolution API base URL not found")
  }

  const nameProviderResolution = new ResolveNameService(
    ARGENT_NAME_RESOLUTION_API_BASE_URL,
    {
      headers: argentApiHeadersForNetwork(network.id),
    },
  )

  const starknetIdNetwork = argentApiNetworkForNetwork(network.id)

  if (!starknetIdNetwork) {
    throw new Error("No valid network found for the StarknetId API")
  }

  const response = await nameProviderResolution.getStarknetIdFromAddress(
    starknetIdNetwork,
    [addressSchema.parse(account.address)],
  )

  const provider = response[0].resolutions?.find(
    (resolution) => resolution.provider === "starknet.id",
  )

  if (!provider?.name) {
    throw new Error("No StarknetId found for this address")
  }

  return provider.name
}

export async function getStarknetIdOnchain(account: BaseWalletAccount) {
  try {
    const network = await networkService.getById(account.networkId)
    const chainId = getChainIdFromNetworkId(network.id)
    const multicall = getMulticallForNetwork(network)
    const starknetIdContractAddress = starknetId.getStarknetIdContract(chainId)

    const call: Call = {
      contractAddress: starknetIdContractAddress,
      entrypoint: "address_to_domain",
      calldata: [account.address, []],
    }

    const response = await multicall.callContract(call)
    const decimalDomain = response.slice(1).map(BigInt)
    const stringDomain = starknetId.useDecoded(decimalDomain)

    if (!stringDomain) {
      throw new Error("Starkname not found")
    }

    //  Check expiration date
    const [expiration] = await multicall
      .callContract({
        contractAddress: starknetIdContractAddress,
        entrypoint: "domain_to_expiry",
        calldata: [decimalDomain],
      })
      .then((res) => res.map(BigInt))

    const currentTime = BigInt(Math.floor(Date.now() / 1000))

    if (expiration < currentTime) {
      throw new Error("StarknetId expired")
    }

    return stringDomain
  } catch (e) {
    console.log(e)
  }
}
