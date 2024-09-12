import { stark } from "starknet"
import { ArgentSigner, LedgerSigner } from "./index"

import { SignerType } from "../wallet.model"
import { LedgerSharedService } from "../ledger/service/LedgerSharedService"
import { MultisigBackendService } from "../multisig/service/backend/MultisigBackendService"

const TEST_DERIVATION_PATH = "m/44'/60'/0'/0/0"

const networkServiceMock = {
  getById: vi.fn(),
}

const multisigBackendServiceMock = new MultisigBackendService("mockBackendUrl")

const ledgerServiceMock = new LedgerSharedService(
  networkServiceMock,
  multisigBackendServiceMock,
)

describe("Signers tests", () => {
  it("should return ArgentSigner", () => {
    const signer = new ArgentSigner(stark.randomAddress(), TEST_DERIVATION_PATH)

    expect(signer).toBeInstanceOf(ArgentSigner)
    expect(signer.signerType).toBe(SignerType.LOCAL_SECRET)
    expect(ArgentSigner.isValid(signer)).toBe(true)
  })

  it("should return padded 32 bytes pk", async () => {
    const signer = new ArgentSigner(stark.randomAddress(), TEST_DERIVATION_PATH)
    const pk = signer.getPrivateKey()
    expect(pk.length).toBe(66)
  })

  it("should return LedgerSigner", async () => {
    const signer = new LedgerSigner(ledgerServiceMock, TEST_DERIVATION_PATH)
    expect(signer).toBeInstanceOf(LedgerSigner)
    expect(signer.signerType).toBe(SignerType.LEDGER)
    expect(LedgerSigner.isValid(signer)).toBe(true)
  })
})
