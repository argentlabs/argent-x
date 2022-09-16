import { SequencerProvider, hash, stark } from "starknet"

export async function getAccountByPubKey(
  pubKey: string,
  network: "mainnet-alpha" | "goerli-alpha",
  contractClassHash: string,
  accountClassHash: string,
) {
  const provider = new SequencerProvider({ network })

  const address = hash.calculateContractAddressFromHash(
    pubKey,
    contractClassHash,
    stark.compileCalldata({
      implementation: accountClassHash,
      selector: hash.getSelectorFromName("initialize"),
      calldata: stark.compileCalldata({
        signer: pubKey,
        guardian: "0",
      }),
    }),
    0,
  )

  const code = await provider.getCode(address)

  return {
    address,
    networkId: network,
    deployed: code.bytecode.length > 0,
    pubKey,
  }
}
