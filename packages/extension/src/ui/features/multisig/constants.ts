import { MultisigData } from "../../../shared/wallet.model"

export const ZERO_MULTISIG: MultisigData = {
  signers: [],
  threshold: 0,
  creator: undefined,
  publicKey: "0x0",
  updatedAt: Date.now(),
}
