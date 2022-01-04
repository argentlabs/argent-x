import { Provider, Signer } from "starknet"

type GetSignerOptions = {
  type: "LOCAL"
  address: string
  network: string
  keyPair: string
}

export async function getSigner(options: GetSignerOptions): Promise<Signer> {
  const { type, address, network, keyPair } = options

  const provider = new Provider({ network: network as any })

  switch (type) {
    case "LOCAL":
    default: {
      return new Signer(provider, address, keyPair)
    }
  }
}
