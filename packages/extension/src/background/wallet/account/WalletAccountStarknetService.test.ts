import { WalletAccountStarknetService } from "./WalletAccountStarknetService"
import { WalletSessionService } from "../session/WalletSessionService"
import { WalletAccountSharedService } from "../../../shared/account/service/accountSharedService/WalletAccountSharedService"
import { WalletCryptoStarknetService } from "../crypto/WalletCryptoStarknetService"
import { MultisigAccount } from "../../../shared/multisig/account"
import {
  accountSharedServiceMock,
  accountStarknetServiceMock,
  cryptoStarknetServiceMock,
  sessionServiceMock,
  ledgerServiceMock,
} from "../test.utils"
import { Account, stark } from "starknet"
import {
  ArgentSigner,
  GuardianSignerV2,
  LedgerSigner,
} from "../../../shared/signer"
import { StarknetAccount } from "../../../shared/starknetAccount"
import { SmartAccount } from "../../../shared/smartAccount/account"
import { cosignerSign } from "../../../shared/smartAccount/backend/account"
import { addressSchema } from "@argent/x-shared"
import { getBaseDerivationPath } from "../../../shared/signer/utils"
import { SignerType } from "../../../shared/wallet.model"

// Mock dependencies
vi.mock("../session/session.service")
vi.mock("./shared.service")
vi.mock("../crypto/starknet.service")

const testAddress = addressSchema.parse(stark.randomAddress())

describe("AccountStarknetService", () => {
  let accountStarknetService: WalletAccountStarknetService
  let sessionService: WalletSessionService
  let accountSharedService: WalletAccountSharedService
  let cryptoStarknetService: WalletCryptoStarknetService

  beforeEach(() => {
    sessionService = sessionServiceMock
    accountSharedService = accountSharedServiceMock
    cryptoStarknetService = cryptoStarknetServiceMock
    accountStarknetService = accountStarknetServiceMock
  })

  describe("getStarknetAccount", () => {
    it("should throw an error if no session is open", async () => {
      vi.spyOn(sessionService, "isSessionOpen").mockResolvedValue(false)

      await expect(
        accountStarknetService.getStarknetAccount({
          address: testAddress,
          networkId: "net1",
        }),
      ).rejects.toThrow("no open session")
    })

    it("should throw an error if account is not found", async () => {
      vi.spyOn(sessionService, "isSessionOpen").mockResolvedValue(true)
      vi.spyOn(accountSharedService, "getAccount").mockResolvedValue(null)

      await expect(
        accountStarknetService.getStarknetAccount({
          address: testAddress,
          networkId: "net1",
        }),
      ).rejects.toThrow("Account not found")
    })
  })

  describe("getSelectedStarknetAccount", () => {
    it("should throw an error if no session is open", async () => {
      vi.spyOn(sessionService, "isSessionOpen").mockResolvedValue(false)

      await expect(
        accountStarknetService.getSelectedStarknetAccount(),
      ).rejects.toThrow("no open session")
    })

    it("should throw an error if no selected account", async () => {
      vi.spyOn(sessionService, "isSessionOpen").mockResolvedValue(true)
      vi.spyOn(accountSharedService, "getSelectedAccount").mockResolvedValue(
        undefined,
      )

      await expect(
        accountStarknetService.getSelectedStarknetAccount(),
      ).rejects.toThrow("no selected account")
    })
  })

  describe("newPendingMultisig", () => {
    it("should create a new pending multisig", async () => {
      const mockPublicKey = "mockPublicKey"
      const mockNetworkId = "mockNetworkId"
      const mockDerivationPath = "mockDerivationPath"
      vi.spyOn(
        cryptoStarknetService,
        "getNextPublicKeyForMultisig",
      ).mockResolvedValue({
        index: 0,
        publicKey: mockPublicKey,
        derivationPath: mockDerivationPath,
      })
      const pushSpy = vi.spyOn(
        accountStarknetService["pendingMultisigStore"],
        "upsert",
      )

      const signerType = SignerType.LOCAL_SECRET

      const result = await accountStarknetService.newPendingMultisig(
        mockNetworkId,
        signerType,
      )

      expect(result).toEqual(
        expect.objectContaining({
          name: "Multisig 1",
          networkId: mockNetworkId,
          signer: {
            type: signerType,
            derivationPath: mockDerivationPath,
          },
          publicKey: mockPublicKey,
          type: "multisig",
        }),
      )
      expect(pushSpy).toHaveBeenCalledWith(result)
    })
  })

  describe("getStarknetAccountOfType", () => {
    it('should return MultisigAccount if type is "multisig"', () => {
      const mockArgentSigner = new ArgentSigner(
        stark.randomAddress(),
        getBaseDerivationPath("multisig", SignerType.LOCAL_SECRET) + "/0",
      )
      const mockAccount = new Account(
        {},
        stark.randomAddress(),
        mockArgentSigner,
      )

      const result = accountStarknetService.getStarknetAccountOfType(
        mockAccount,
        mockArgentSigner,
        { type: "multisig" },
      )
      expect(result).toBeInstanceOf(MultisigAccount)
    })

    it('should return Account if type is not "multisig"', () => {
      const mockArgentSigner = new ArgentSigner(
        stark.randomAddress(),
        getBaseDerivationPath("standard", SignerType.LOCAL_SECRET) + "/0",
      )
      const mockAccount = new Account({}, testAddress, mockArgentSigner)

      const result = accountStarknetService.getStarknetAccountOfType(
        mockAccount,
        mockArgentSigner,
        { type: "standard" },
      )
      expect(result).toBeInstanceOf(Account)
    })

    it("should return StarknetAccount with ArgentSigner", () => {
      const mockArgentSigner = new ArgentSigner(
        stark.randomAddress(),
        getBaseDerivationPath("standard", SignerType.LOCAL_SECRET) + "/0",
      )
      const mockAccount = new Account({}, testAddress, mockArgentSigner)

      const result = accountStarknetService.getStarknetAccountOfType(
        mockAccount,
        mockArgentSigner,
        { type: "standard" },
      )
      expect(result).toBeInstanceOf(StarknetAccount)
    })

    it("should not throw if LedgerSigner is used with StarknetAccount", async () => {
      const mockAccount = new Account({}, testAddress, stark.randomAddress())
      const mockLedgerSigner = new LedgerSigner(
        ledgerServiceMock,
        "m/44'/60'/0'/0/0",
      )

      const result = accountStarknetService.getStarknetAccountOfType(
        mockAccount,
        mockLedgerSigner,
        { type: "standard" },
      )

      expect(result).toBeInstanceOf(StarknetAccount)
    })

    it("should throw if GuardianSigner is used with StarknetAccount", async () => {
      const mockAccount = new Account({}, testAddress, stark.randomAddress())
      const mockGuardianSigner = new GuardianSignerV2(
        cosignerSign,
        stark.randomAddress(),
      )

      expect(() =>
        accountStarknetService.getStarknetAccountOfType(
          mockAccount,
          mockGuardianSigner,
          { type: "standard" },
        ),
      ).toThrow("Unsupported signer for StarknetAccount: cosigner")
    })

    it("should return if ArgentSigner and no guardian is used with SmartAccount", () => {
      const mockAccount = new Account({}, testAddress, stark.randomAddress())
      const mockArgentSigner = new ArgentSigner(
        stark.randomAddress(),
        getBaseDerivationPath("smart", SignerType.LOCAL_SECRET) + "/0",
      )

      const result = accountStarknetService.getStarknetAccountOfType(
        mockAccount,
        mockArgentSigner,
        { type: "smart", guardian: undefined },
      )

      expect(result).toBeInstanceOf(SmartAccount)
      expect(result.signer).toEqual(mockArgentSigner)
      expect((result as SmartAccount).guardian).toEqual(mockArgentSigner)
    })

    it("should return if ArgentSigner and guardian same as owner is used with SmartAccount", async () => {
      const ownerSigner = new ArgentSigner(
        stark.randomAddress(),
        getBaseDerivationPath("smart", SignerType.LOCAL_SECRET) + "/0",
      )
      const mockAccount = new Account({}, testAddress, stark.randomAddress())

      const result = accountStarknetService.getStarknetAccountOfType(
        mockAccount,
        ownerSigner,
        { type: "smart", guardian: ownerSigner.getStarkKey() },
      )
      expect(result).toBeInstanceOf(SmartAccount)
      expect(result.signer).toEqual(ownerSigner)
      expect((result as SmartAccount).guardian).toEqual(ownerSigner)
    })

    it("should return if ArgentSigner and guardian different than owner is used with SmartAccount", async () => {
      const ownerSigner = new ArgentSigner(
        stark.randomAddress(),
        getBaseDerivationPath("smart", SignerType.LOCAL_SECRET) + "/0",
      )
      const mockAccount = new Account({}, testAddress, stark.randomAddress())

      const guardianPubKey = stark.randomAddress()

      const guardian = new GuardianSignerV2(cosignerSign, guardianPubKey)

      const result = accountStarknetService.getStarknetAccountOfType(
        mockAccount,
        ownerSigner,
        { type: "smart", guardian: guardianPubKey },
      )
      expect(result).toBeInstanceOf(SmartAccount)
      expect(result.signer).toBe(ownerSigner)
      expect((result as SmartAccount).guardian).not.toBe(ownerSigner)
      expect((result as SmartAccount).guardian).toEqual(guardian)
    })

    it("should throw if LedgerSigner is used with SmartAccount", async () => {
      const mockAccount = new Account({}, testAddress, stark.randomAddress())
      const mockLedgerSigner = new LedgerSigner(
        ledgerServiceMock,
        "m/44'/60'/0'/0/0",
      )

      expect(() =>
        accountStarknetService.getStarknetAccountOfType(
          mockAccount,
          mockLedgerSigner,
          { type: "smart", guardian: undefined },
        ),
      ).toThrow("Unsupported signer for SmartAccount: ledger")
    })

    it("should return MultisigAccount with ArgentSigner", () => {
      const mockArgentSigner = new ArgentSigner(
        stark.randomAddress(),
        getBaseDerivationPath("multisig", SignerType.LOCAL_SECRET) + "/0",
      )
      const mockAccount = new Account({}, testAddress, mockArgentSigner)

      const result = accountStarknetService.getStarknetAccountOfType(
        mockAccount,
        mockArgentSigner,
        { type: "multisig" },
      )
      expect(result).toBeInstanceOf(MultisigAccount)
    })

    it("should return MultisigAccount with LedgerSigner", async () => {
      const mockAccount = new Account({}, testAddress, stark.randomAddress())
      const mockLedgerSigner = new LedgerSigner(
        ledgerServiceMock,
        getBaseDerivationPath("multisig", SignerType.LEDGER) + "/0",
      )

      const result = accountStarknetService.getStarknetAccountOfType(
        mockAccount,
        mockLedgerSigner,
        { type: "multisig" },
      )
      expect(result).toBeInstanceOf(MultisigAccount)
    })

    it("should throw if GuardianSigner is used with MultisigAccount", async () => {
      const mockAccount = new Account({}, testAddress, stark.randomAddress())
      const mockGuardianSigner = new GuardianSignerV2(
        cosignerSign,
        stark.randomAddress(),
      )

      expect(() =>
        accountStarknetService.getStarknetAccountOfType(
          mockAccount,
          mockGuardianSigner,
          { type: "multisig" },
        ),
      ).toThrow("Unsupported signer for MultisigAccount: cosigner")
    })
  })
})
