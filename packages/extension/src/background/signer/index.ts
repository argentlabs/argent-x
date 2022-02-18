import { Signer } from "starknet"

import { BackupWallet } from "../../shared/backup.model"
import { getProvider } from "../../shared/networks"
import { getStarkPair } from "../keys/keyDerivation"
import { getL1 } from "../keys/l1"

export async function getSigner(wallet: BackupWallet): Promise<Signer> {
  const provider = getProvider(wallet.network)

  switch (wallet.signer.type) {
    case "local_secret":
    default: {
      const l1 = await getL1()
      const keyPair = getStarkPair(wallet.signer.derivation_path, l1.privateKey)
      return new Signer(provider, wallet.address, keyPair)
    }
  }
}
