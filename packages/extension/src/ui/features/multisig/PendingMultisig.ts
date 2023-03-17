// Write a PendingMultisig class such that it can be used during Joining a Multisig
// This multisig will be used to display the pending multisig in the UI
// This should only contain the public key (signer) and the network

import { Network } from "../../../shared/network"

export interface PendingMultisigConstructor {
  signer: string
  network: Network
}

export class PendingMultisig {
  signer: string
  network: Network
  networkId: string

  constructor({ signer, network }: PendingMultisigConstructor) {
    this.signer = signer
    this.network = network
    this.networkId = network.id
  }
}
