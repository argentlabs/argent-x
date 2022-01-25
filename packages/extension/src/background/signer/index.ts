import { Signer } from "starknet"

import { getProvider } from "../../shared/networks"

type GetSignerOptions = {
  type: "LOCAL"
  address: string
  network: string
  keyPair: string
}

export async function getSigner(options: GetSignerOptions): Promise<Signer> {
  const { type, address, network, keyPair } = options

  const provider = getProvider(network)

  switch (type) {
    case "LOCAL":
    default: {
      return new Signer(provider, address, keyPair)
    }
  }
}
