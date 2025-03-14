import type { Provider } from "starknet"
import { constants, stark } from "starknet"
import type { Mocked } from "vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { INetworkService } from "../../network/service/INetworkService"
import { AccountImportSharedService } from "./AccountImportSharedService"
import * as providerModule from "../../network"
import { ImportedAccount } from "../account"
import { AccountImportError } from "../types"
import { getMockNetwork } from "../../../../test/network.mock"
import { MockFnRepository } from "../../storage/__new/__test__/mockFunctionImplementation"
import type { INetworkRepo } from "../../network/store"
import { NetworkService } from "../../network/service/NetworkService"
import type { IPKManager } from "../pkManager/IPKManager"
import type { WalletAccount } from "../../wallet.model"
import { SignerType } from "../../wallet.model"
import type { Hex } from "@argent/x-shared"
import { addressSchema, hexSchema } from "@argent/x-shared"
import { getAccountIdentifier } from "../../utils/accountIdentifier"
import type { IAccountService } from "../../account/service/accountService/IAccountService"
import { getAccountMeta } from "../../accountNameGenerator"

vi.mock("../../network/makeSafeNetworks", () => ({
  makeSafeNetworks: vi.fn().mockImplementation((networks) => networks),
}))

// Mock dependencies
vi.mock("../../network")
vi.mock("../account")
vi.mock("../../signer/PrivateKeySigner")

describe("ImportAccountSharedService", () => {
  const mockAddress = addressSchema.parse(stark.randomAddress())
  const mockNetworkId = "sepolia-alpha"
  const mockPk = "0xabcdef1234567890" as Hex
  const mockProvider = {
    getClassHashAt: vi.fn(),
  } as unknown as Mocked<Provider>
  const mockImportedAccount = {
    simulateTransaction: vi.fn(),
  } as unknown as Mocked<ImportedAccount>

  const mockAccountService = {
    upsert: vi.fn(),
    get: vi.fn(),
  } as unknown as Mocked<IAccountService>

  const mockNetwork = getMockNetwork()
  let mockNetworkRepo: MockFnRepository<INetworkRepo>

  let service: AccountImportSharedService
  let mockNetworkService: Mocked<INetworkService>
  let mockPkManager: Mocked<IPKManager>

  beforeEach(() => {
    vi.resetAllMocks()
    mockNetworkRepo = new MockFnRepository()
    mockNetworkService = vi.mocked<INetworkService>(
      new NetworkService(mockNetworkRepo),
    )
    mockNetworkService.getById = vi.fn().mockResolvedValue(mockNetwork)
    vi.mocked(providerModule.getProvider).mockReturnValue(mockProvider)
    vi.mocked(ImportedAccount).mockReturnValue(mockImportedAccount)

    mockPkManager = {
      storeEncryptedKey: vi.fn(),
      retrieveDecryptedKey: vi.fn(),
      removeKey: vi.fn(),
    } as Mocked<IPKManager>

    service = new AccountImportSharedService(
      mockAccountService,
      mockNetworkService,
      mockPkManager,
    )
  })

  describe("validateImportedAccount", () => {
    it("should return ACCOUNT_NOT_FOUND if provider.getClassHashAt throws", async () => {
      mockProvider.getClassHashAt.mockRejectedValue(new Error("Not found"))

      const result = await service.validateImport(
        mockAddress,
        mockPk,
        mockNetworkId,
      )

      expect(result).toEqual({
        success: false,
        errorType: AccountImportError.ACCOUNT_NOT_FOUND,
      })
    })

    it("should return INVALID_PK if validatePrivateKey throws", async () => {
      mockProvider.getClassHashAt.mockResolvedValue("0xclasshash")
      mockImportedAccount.simulateTransaction.mockRejectedValue(
        new Error("Simulation failed"),
      )

      const result = await service.validateImport(
        mockAddress,
        mockPk,
        mockNetworkId,
      )

      expect(result).toEqual({
        success: false,
        errorType: AccountImportError.INVALID_PK,
      })
    })

    it("should return success if everything is valid", async () => {
      const mockClassHash = stark.randomAddress()

      mockProvider.getClassHashAt.mockResolvedValue(mockClassHash)
      mockImportedAccount.simulateTransaction = vi
        .fn()
        .mockResolvedValue(undefined)

      const result = await service.validateImport(
        mockAddress,
        mockPk,
        mockNetworkId,
      )

      expect(result).toEqual({
        success: true,
        result: {
          address: addressSchema.parse(mockAddress),
          networkId: mockNetworkId,
          classHash: addressSchema.parse(mockClassHash),
          pk: hexSchema.parse(mockPk),
        },
      })
    })
  })

  describe("validatePrivateKey", () => {
    it("should try ETH transfer first", async () => {
      mockImportedAccount.simulateTransaction = vi
        .fn()
        .mockResolvedValue(undefined)

      await service["validatePrivateKey"](mockImportedAccount as any)

      expect(mockImportedAccount.simulateTransaction).toHaveBeenNthCalledWith(
        1,
        [
          {
            contractAddress:
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "transfer",
            calldata: [
              "2087021424722619777119509474943472645767659996348769578120564519014510906823",
              "1",
              "0",
            ],
            type: "INVOKE_FUNCTION",
          },
        ],
        {
          skipValidate: false,
          version: constants.TRANSACTION_VERSION.V1,
        },
      )
    })

    it("should try STRK transfer if ETH transfer fails", async () => {
      mockImportedAccount.simulateTransaction = vi
        .fn()
        .mockRejectedValueOnce(new Error("ETH transfer failed"))
        .mockResolvedValueOnce(undefined)

      await service["validatePrivateKey"](mockImportedAccount as any)

      expect(mockImportedAccount.simulateTransaction).toBeCalledTimes(2)

      expect(mockImportedAccount.simulateTransaction).toHaveBeenNthCalledWith(
        2,
        [
          {
            contractAddress:
              "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
            entrypoint: "transfer",
            calldata: [
              "2009894490435840142178314390393166646092438090257831307886760648929397478285",
              "1",
              "0",
            ],
            type: "INVOKE_FUNCTION",
          },
        ],
        {
          skipValidate: false,
          version: constants.TRANSACTION_VERSION.V3,
        },
      )
    })

    it("should throw if both ETH and STRK transfers fail", async () => {
      mockImportedAccount.simulateTransaction
        .mockRejectedValueOnce(new Error("ETH transfer failed"))
        .mockRejectedValueOnce(new Error("STRK transfer failed"))

      await expect(
        service["validatePrivateKey"](mockImportedAccount as any),
      ).rejects.toThrow("STRK transfer failed")
    })

    it("should use the correct transaction version for ETH transfer", async () => {
      mockImportedAccount.simulateTransaction = vi
        .fn()
        .mockResolvedValue(undefined)

      await service["validatePrivateKey"](mockImportedAccount as any)

      expect(mockImportedAccount.simulateTransaction).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          version: constants.TRANSACTION_VERSION.V1,
        }),
      )
    })

    it("should use the correct transaction version for STRK transfer", async () => {
      mockImportedAccount.simulateTransaction = vi
        .fn()
        .mockRejectedValueOnce(new Error("ETH transfer failed"))
        .mockResolvedValueOnce(undefined)

      await service["validatePrivateKey"](mockImportedAccount as any)

      expect(mockImportedAccount.simulateTransaction).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          version: constants.TRANSACTION_VERSION.V3,
        }),
      )
    })
  })

  describe("importAccount", () => {
    it("should successfully import a valid account", async () => {
      const mockValidationResult = {
        success: true as const,
        result: {
          address: addressSchema.parse(mockAddress),
          networkId: mockNetworkId,
          classHash: addressSchema.parse(stark.randomAddress()),
          pk: hexSchema.parse(mockPk),
        },
      }

      vi.spyOn(service, "validateImport").mockResolvedValue(
        mockValidationResult,
      )
      mockPkManager.storeEncryptedKey.mockResolvedValue(undefined)
      mockAccountService.get.mockResolvedValue([])
      mockAccountService.upsert.mockResolvedValue(undefined)

      const result = await service.importAccount(
        mockValidationResult.result,
        "password",
      )

      const signer = {
        type: SignerType.PRIVATE_KEY,
        derivationPath: "m/0/0/0/0/0",
      }

      const id = getAccountIdentifier(
        mockValidationResult.result.address,
        mockValidationResult.result.networkId,
        signer,
      )

      expect(result).toEqual({
        id,
        address: mockValidationResult.result.address,
        networkId: mockValidationResult.result.networkId,
        signer,
        name: getAccountMeta(id, "imported").name,
        type: "imported",
        network: mockNetwork,
        needsDeploy: false,
        classHash: mockValidationResult.result.classHash,
        cairoVersion: "1",
      })
      expect(mockPkManager.storeEncryptedKey).toHaveBeenCalledWith(
        mockPk,
        "password",
        id,
      )
      expect(mockAccountService.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          address: addressSchema.parse(mockAddress),
          networkId: mockNetworkId,
        }),
      )
    })

    it("should handle multiple imported accounts", async () => {
      const mockValidationResult = {
        success: true as const,
        result: {
          address: addressSchema.parse(mockAddress),
          networkId: mockNetworkId,
          classHash: addressSchema.parse(stark.randomAddress()),
          pk: hexSchema.parse(mockPk),
        },
      }

      vi.spyOn(service, "validateImport").mockResolvedValue(
        mockValidationResult,
      )
      mockPkManager.storeEncryptedKey.mockResolvedValue(undefined)
      mockAccountService.get.mockResolvedValue([
        {} as WalletAccount,
        {} as WalletAccount,
      ])
      mockAccountService.upsert.mockResolvedValue(undefined)

      const result = await service.importAccount(
        mockValidationResult.result,
        "password",
      )

      expect(result.name).toEqual(getAccountMeta(result.id, "imported").name)
    })

    it("should throw an error if storeEncryptedKey fails", async () => {
      const mockValidationResult = {
        success: true as const,
        result: {
          address: addressSchema.parse(mockAddress),
          networkId: mockNetworkId,
          classHash: addressSchema.parse(stark.randomAddress()),
          pk: hexSchema.parse(mockPk),
        },
      }

      vi.spyOn(service, "validateImport").mockResolvedValue(
        mockValidationResult,
      )
      mockPkManager.storeEncryptedKey.mockRejectedValue(
        new Error("Failed to store key"),
      )
      mockAccountService.get.mockResolvedValue([])

      await expect(
        service.importAccount(mockValidationResult.result, "password"),
      ).rejects.toThrow("Failed to store key")
    })
  })
})
