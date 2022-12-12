import { memoize } from "lodash-es"
import { SequencerProvider, defaultProvider } from "starknet"

import { SupportedNetworks } from "../../sdk"

export const getProviderForBaseUrl = memoize(
  (baseUrl: string) => {
    return new SequencerProvider({ baseUrl })
  },
  (baseUrl) => baseUrl,
)

export const getProviderForNetworkId = memoize(
  (networkId: SupportedNetworks) => {
    switch (networkId) {
      case SupportedNetworks.MAINNET:
        return getProviderForBaseUrl("https://alpha-mainnet.starknet.io")
      case SupportedNetworks.TESTNET:
        return getProviderForBaseUrl("https://alpha4.starknet.io")
      case SupportedNetworks.TESTNET2:
        return getProviderForBaseUrl("https://alpha4-2.starknet.io")
      default: {
        console.error(
          `Network not supported: ${networkId}. Using default provider.`,
        )
        return defaultProvider
      }
    }
  },
  (networkId) => networkId,
)
