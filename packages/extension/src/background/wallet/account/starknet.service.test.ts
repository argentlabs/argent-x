import { WalletAccountStarknetService } from "./starknet.service"
import { WalletSessionService } from "../session/session.service"
import { WalletAccountSharedService } from "./shared.service"
import { WalletCryptoStarknetService } from "../crypto/starknet.service"
import { MultisigAccount } from "../../../shared/multisig/account"
import {
  accountSharedServiceMock,
  accountStarknetServiceMock,
  cryptoStarknetServiceMock,
  sessionServiceMock,
} from "../test.utils"
import { Account } from "starknet"
import { grindKey } from "../../keys/keyDerivation"
import { MultisigSigner } from "../../../shared/multisig/signer"

// Mock dependencies
vi.mock("../session/session.service")
vi.mock("./shared.service")
vi.mock("../crypto/starknet.service")

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
          address: "0x0",
          networkId: "net1",
        }),
      ).rejects.toThrow("no open session")
    })

    it("should throw an error if account is not found", async () => {
      vi.spyOn(sessionService, "isSessionOpen").mockResolvedValue(true)
      vi.spyOn(accountSharedService, "getAccount").mockResolvedValue(null)

      await expect(
        accountStarknetService.getStarknetAccount({
          address: "0x0",
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

      const result = await accountStarknetService.newPendingMultisig(
        mockNetworkId,
      )

      expect(result).toEqual(
        expect.objectContaining({
          name: "Multisig 1",
          networkId: mockNetworkId,
          signer: {
            type: "local_secret",
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
      const signer = new MultisigSigner(grindKey("0x1"))
      const mockAccount = new Account({}, "0x0", signer)
      const result = accountStarknetService.getStarknetAccountOfType(
        mockAccount,
        "multisig",
      )
      expect(result).toBeInstanceOf(MultisigAccount)
    })

    it('should return Account if type is not "multisig"', () => {
      const mockAccount = new Account({}, "0x0", grindKey("0x1"))
      const result = accountStarknetService.getStarknetAccountOfType(
        mockAccount,
        "standard",
      )
      expect(result).toBeInstanceOf(Account)
    })
  })
})
