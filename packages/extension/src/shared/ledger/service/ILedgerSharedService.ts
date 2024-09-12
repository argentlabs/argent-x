import { Address } from "@argent/x-shared"
import { PublicKeyWithIndex } from "../../signer/types"
import { LedgerSigner } from "../../signer"
import { CreateAccountType } from "../../wallet.model"

export interface ILedgerSharedService {
  connect: () => Promise<Address>
  getSigner(derivationPath: string): Promise<LedgerSigner>
  getPubKey: (derivationPath: string) => Promise<Address>
  getNextAvailablePublicKey: (
    accountType: CreateAccountType,
    currentIndex: number,
    usedIndices: number[],
    networkId: string,
  ) => Promise<PublicKeyWithIndex>
  generatePublicKeys(
    accountType: CreateAccountType,
    start: number,
    numberOfPairs: number,
  ): Promise<PublicKeyWithIndex[]>
  deinitApp: () => Promise<void>
}
