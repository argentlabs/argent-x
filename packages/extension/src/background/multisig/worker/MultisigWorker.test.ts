import { addressSchema, isEqualAddress } from "@argent/x-shared"
import type { Mocked } from "vitest"
import {
  CHANGE_SIGNER_ACTIVITIES,
  SEND_ACTIVITIES,
} from "../../test/__fixtures__/activities"
import type { IAccountService } from "../../../shared/account/service/accountService/IAccountService"
import type { WalletAccountSharedService } from "../../../shared/account/service/accountSharedService/WalletAccountSharedService"
import type { IActivityCacheService } from "../../../shared/activity/cache/IActivityCacheService"
import { getMockDebounceService } from "../../../shared/debounce/mock"
import type { IMultisigBackendService } from "../../../shared/multisig/service/backend/IMultisigBackendService"
import type { INetworkService } from "../../../shared/network/service/INetworkService"
import type { INotificationService } from "../../../shared/notifications/INotificationService"
import { createScheduleServiceMock } from "../../../shared/schedule/mock"
import type {
  BaseMultisigWalletAccount,
  MultisigWalletAccount,
} from "../../../shared/wallet.model"
import type { IActivityService } from "../../services/activity/IActivityService"
import type { IBackgroundUIService } from "../../services/ui/IBackgroundUIService"
import { SignerType } from "./../../../shared/wallet.model"
import { MultisigWorker } from "./MultisigWorker"
import { MockFnRepository } from "../../../shared/storage/__new/__test__/mockFunctionImplementation"
import {
  getAccountIdentifier,
  getRandomAccountIdentifier,
} from "../../../shared/utils/accountIdentifier"
import { getDerivationPathForIndex } from "../../../shared/signer/utils"
import { stark } from "starknet"
import { getMockWalletAccount } from "../../../../test/walletAccount.mock"

const mockAccount: MultisigWalletAccount = {
  address: "0x2418f74a90c5f8488d011c811a6d40148ca3f3491965cf247fb03a85ba88213",
  cairoVersion: "1",
  classHash:
    "0x06e150953b26271a740bf2b6e9bca17cc52c68d765f761295de51ceb8526ee72",
  id: "0x02418f74a90c5f8488d011c811a6d40148ca3f3491965cf247fb03a85ba88213::sepolia-alpha::local_secret::3",
  index: 3,
  name: "Multisig 3",
  needsDeploy: false,
  networkId: "sepolia-alpha",
  signer: {
    derivationPath: "m/44'/9004'/1'/0/3",
    type: SignerType.LOCAL_SECRET,
  },
  type: "multisig",
  network: {
    id: "sepolia-alpha",
    name: "Sepolia",
    chainId: "SN_SEPOLIA",
    rpcUrl: "https://api.hydrogen.argent47.net/v1/starknet/sepolia/rpc/v0.7",
    explorerUrl: "https://sepolia.voyager.online",
    l1ExplorerUrl: "https://sepolia.etherscan.io",
    accountClassHash: {
      standard:
        "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f",
      standardCairo0:
        "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2",
      multisig:
        "0x6e150953b26271a740bf2b6e9bca17cc52c68d765f761295de51ceb8526ee72",
      smart:
        "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f",
    },
    multicallAddress:
      "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
    possibleFeeTokenAddresses: [
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    ],
    readonly: true,
  },
  publicKey:
    "0x03e72009beaa727fcd904f75a75799b0158fb67269c4fe4ef16029edee49f9bb",
  signers: [
    "0x06c0fcbc5948d472c752bd59f229d1e3431bd75a26b7f4532e507c666a5579a0",
    "0x0141611519ff946ec55650efff36a1d65c0b253ec39d7742fcf548985294eed0",
  ],
  threshold: 2,
  updatedAt: 1725273484692,
}

describe("MultisigWorker", () => {
  const mockBackgroundUIService = {
    emitter: {
      on: vi.fn(),
    },
  } as unknown as IBackgroundUIService
  const mockActivityService = {
    emitter: { on: vi.fn() },
  } as unknown as Mocked<IActivityService>
  const mockActivityCacheService = {
    getCachedActivities: vi.fn(),
  } as unknown as Mocked<IActivityCacheService>
  const mockMultisigBackendService =
    {} as unknown as Mocked<IMultisigBackendService>
  const mockAccountService = {
    get: vi.fn(),
    remove: vi.fn(),
  } as unknown as Mocked<IAccountService>
  const mockWalletAccountSharedService =
    {} as unknown as Mocked<WalletAccountSharedService>
  const mockNetworkService = {} as unknown as Mocked<INetworkService>
  const mockNotificationService = {} as unknown as Mocked<INotificationService>

  const [, _mockScheduleService] = createScheduleServiceMock()
  const mockScheduleService = _mockScheduleService

  const mockDebounceService = getMockDebounceService()

  const mockBaseMultisigRepo = new MockFnRepository()

  const multisigMetadataRepo = new MockFnRepository()

  const multisigWorker = new MultisigWorker(
    mockBaseMultisigRepo,
    multisigMetadataRepo,
    mockScheduleService,
    mockMultisigBackendService,
    mockBackgroundUIService,
    mockDebounceService,
    mockAccountService,
    mockWalletAccountSharedService,
    mockNetworkService,
    mockNotificationService,
    mockActivityCacheService,
    mockActivityService,
  )

  describe("findNewSignerInActivity", async () => {
    it("should return the pending signer", async () => {
      const account = JSON.parse(JSON.stringify(mockAccount))
      account.pendingSigner = {
        pubKey:
          "0x06c0fcbc5948d472c752bd59f229d1e3431bd75a26b7f4532e507c666a5579a0",
        signer: {
          derivationPath: "m/2645'/1195502025'/1148870696'/1'/0'/42",
          type: SignerType.LEDGER,
        },
      }
      mockActivityCacheService.getCachedActivities.mockResolvedValue(
        CHANGE_SIGNER_ACTIVITIES,
      )
      const newSigner = await multisigWorker.findNewSignerInActivity(account)
      expect(
        isEqualAddress(newSigner, account.pendingSigner?.pubKey),
      ).toBeTruthy()
    })

    it("should return undefined if the account has no pending signer", async () => {
      mockActivityCacheService.getCachedActivities.mockResolvedValue(
        CHANGE_SIGNER_ACTIVITIES,
      )
      const newSigner =
        await multisigWorker.findNewSignerInActivity(mockAccount)
      expect(newSigner).toBeUndefined()
    })

    it("should return undefined if the pending signer does not exist", async () => {
      mockActivityCacheService.getCachedActivities.mockResolvedValue(
        SEND_ACTIVITIES,
      )
      const newSigner =
        await multisigWorker.findNewSignerInActivity(mockAccount)
      expect(newSigner).toBeUndefined()
    })
  })

  describe("updateBaseMultisigWalletId", () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    const defaultNetwork = "sepolia-alpha"
    const defaultSignerType = SignerType.LOCAL_SECRET

    const randAddress1 = addressSchema.parse(stark.randomAddress())
    const randAddress2 = addressSchema.parse(stark.randomAddress())

    const signer1 = {
      type: defaultSignerType,
      derivationPath: getDerivationPathForIndex(
        1,
        defaultSignerType,
        "multisig",
      ),
    }

    const signer2 = {
      type: defaultSignerType,
      derivationPath: getDerivationPathForIndex(
        2,
        defaultSignerType,
        "multisig",
      ),
    }

    const randId1 = getRandomAccountIdentifier(
      randAddress1,
      defaultNetwork,
      signer1,
    )
    const randId2 = getRandomAccountIdentifier(
      randAddress2,
      defaultNetwork,
      signer2,
    )

    it("should update base multisig wallets with missing IDs", async () => {
      const walletAccounts = [
        getMockWalletAccount({
          id: randId1,
          address: randAddress1,
          networkId: defaultNetwork,
          signer: signer1,
        }),
        getMockWalletAccount({
          id: randId2,
          address: randAddress2,
          networkId: defaultNetwork,
          signer: signer2,
        }),
      ]
      const baseMultisigs: Omit<BaseMultisigWalletAccount, "id">[] = [
        {
          address: randAddress1,
          networkId: defaultNetwork,
          signers: [],
          threshold: 1,
          creator: "0x789",
          publicKey: "0xabc",
          updatedAt: 1234,
          index: 1,
        },
        {
          address: randAddress2,
          networkId: defaultNetwork,
          signers: [],
          threshold: 1,
          creator: "0x789",
          publicKey: "0xdef",
          updatedAt: 5678,
        },
      ]

      mockAccountService.get.mockResolvedValue(walletAccounts)
      mockBaseMultisigRepo.get.mockResolvedValue(baseMultisigs)

      await multisigWorker.updateBaseMultisigWalletId()

      const expectedUpdatedAccounts: BaseMultisigWalletAccount[] = [
        {
          address: randAddress1,
          networkId: "sepolia-alpha",
          signers: [],
          threshold: 1,
          creator: "0x789",
          publicKey: "0xabc",
          updatedAt: 1234,
          index: 1,
          id: getAccountIdentifier(randAddress1, defaultNetwork, signer1),
        },
        {
          address: randAddress2,
          networkId: defaultNetwork,
          signers: [],
          threshold: 1,
          creator: "0x789",
          publicKey: "0xdef",
          updatedAt: 5678,
          id: randId2,
          index: 2,
        },
      ]

      expect(mockBaseMultisigRepo.remove).toHaveBeenCalledWith(
        expect.any(Function),
      )
      expect(mockBaseMultisigRepo.upsert).toHaveBeenCalledWith(
        expectedUpdatedAccounts,
      )
    })

    it("should not update base multisig wallets if all have IDs", async () => {
      const walletAccounts = [
        getMockWalletAccount({
          id: randId1,
          address: randAddress1,
          signer: { type: SignerType.LOCAL_SECRET, derivationPath: "m/1/2" },
        }),
        getMockWalletAccount({
          id: randId2,
          address: randAddress2,
          signer: { type: SignerType.LOCAL_SECRET, derivationPath: "m/3/4" },
        }),
      ]
      const baseMultisigs: BaseMultisigWalletAccount[] = [
        {
          id: randId1,
          address: randAddress1,
          networkId: defaultNetwork,
          signers: [],
          threshold: 1,
          creator: "0x789",
          publicKey: "0xabc",
          updatedAt: 1234,
          index: 2,
        },
        {
          id: randId2,
          address: randAddress2,
          networkId: defaultNetwork,
          signers: [],
          threshold: 1,
          creator: "0x789",
          publicKey: "0xdef",
          updatedAt: 5678,
          index: 4,
        },
      ]

      mockAccountService.get.mockResolvedValue(walletAccounts)
      mockBaseMultisigRepo.get.mockResolvedValue(baseMultisigs)

      await multisigWorker.updateBaseMultisigWalletId()

      expect(mockBaseMultisigRepo.remove).not.toHaveBeenCalled()
      expect(mockBaseMultisigRepo.upsert).not.toHaveBeenCalled()
    })
  })
})
