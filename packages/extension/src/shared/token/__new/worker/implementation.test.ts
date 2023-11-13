import { IRepository } from "./../../../storage/__new/interface"
import { Mocked } from "vitest"
import { INetworkService } from "../../../network/service/interface"
import { ITokenService } from "../service/interface"
import { TokenWorker, TokenWorkerSchedule } from "./implementation"
import { MockFnRepository } from "../../../storage/__new/__test__/mockFunctionImplementation"
import { WalletStorageProps } from "../../../wallet/walletStore"
import { KeyValueStorage } from "../../../storage"
import { Transaction } from "../../../transactions"
import { Token } from "../types/token.model"
import { IAccountService } from "../../../account/service/interface"
import { IScheduleService } from "../../../schedule/interface"
import {
  emitterMock,
  recoverySharedServiceMock,
  sessionServiceMock,
} from "../../../../background/wallet/test.utils"
import { IBackgroundUIService } from "../../../../background/__new/services/ui/interface"
import { getMockNetwork } from "../../../../../test/network.mock"
import {
  getMockBaseToken,
  getMockToken,
  getMockTokenPriceDetails,
} from "../../../../../test/token.mock"
import { addressSchema } from "@argent/shared"
import { stark } from "starknet"
import { BaseWalletAccount } from "../../../wallet.model"
import { BaseTokenWithBalance } from "../types/tokenBalance.model"
import { TokenPriceDetails } from "../types/tokenPrice.model"
import { defaultNetwork } from "../../../network"

const accountAddress1 = addressSchema.parse(stark.randomAddress())
const accountAddress2 = addressSchema.parse(stark.randomAddress())
const tokenAddress1 = addressSchema.parse(stark.randomAddress())
const tokenAddress2 = addressSchema.parse(stark.randomAddress())

describe("TokenWorker", () => {
  let tokenWorker: TokenWorker
  let mockTokenService: Mocked<ITokenService>
  let mockNetworkService: Mocked<INetworkService>
  let mockWalletStore: KeyValueStorage<WalletStorageProps>
  let mockTransactionsRepo: IRepository<Transaction>
  let mockTokenRepo: IRepository<Token>
  let mockAccountService: IAccountService
  let mockScheduleService: IScheduleService<TokenWorkerSchedule>
  let mockBackgroundUIService: IBackgroundUIService

  beforeEach(() => {
    // Initialize mocks
    mockTokenService = {
      fetchTokensFromBackend: vi.fn(),
      updateTokens: vi.fn(),
      addToken: vi.fn(),
      removeToken: vi.fn(),
      fetchTokenBalancesFromOnChain: vi.fn(),
      fetchTokenDetails: vi.fn(),
      fetchTokenPricesFromBackend: vi.fn(),
      getCurrencyValueForTokens: vi.fn(),
      getToken: vi.fn(),
      getTokenBalancesForAccount: vi.fn(),
      getTokens: vi.fn(),
      getTotalCurrencyBalanceForAccounts: vi.fn(),
      updateTokenBalances: vi.fn(),
      updateTokenPrices: vi.fn(),
    }

    mockNetworkService = {
      get: vi.fn(),
      getById: vi.fn(),
    } as unknown as Mocked<INetworkService>

    mockWalletStore = {
      get: vi.fn(),
      set: vi.fn(),
      subscribe: vi.fn(),
    } as unknown as KeyValueStorage<WalletStorageProps>

    mockAccountService = {
      get: vi.fn(),
    } as unknown as IAccountService

    mockTransactionsRepo = new MockFnRepository()
    mockTokenRepo = new MockFnRepository()

    mockBackgroundUIService = {
      emitter: emitterMock,
      openUiAndUnlock: vi.fn(),
    } as unknown as IBackgroundUIService

    mockScheduleService = {
      registerImplementation: vi.fn(),
      in: vi.fn(),
      every: vi.fn(),
      delete: vi.fn(),
      onInstallAndUpgrade: vi.fn(),
      onStartup: vi.fn(),
    }

    tokenWorker = new TokenWorker(
      mockWalletStore,
      mockTransactionsRepo,
      mockTokenRepo,
      mockTokenService,
      mockAccountService,
      mockNetworkService,
      sessionServiceMock,
      recoverySharedServiceMock,
      mockBackgroundUIService,
      mockScheduleService,
    )
  })

  describe("updateTokens", () => {
    it("should fetch tokens for all networks and update the token service", async () => {
      // Arrange
      const mockNetworks = [
        getMockNetwork({ id: "1" }),
        getMockNetwork({ id: "2" }),
      ]
      const mockTokens = [
        [getMockToken({ address: tokenAddress1, networkId: "1" })],
        [getMockToken({ address: tokenAddress2, networkId: "2" })],
      ]
      mockNetworkService.get.mockResolvedValue(mockNetworks)
      mockTokenService.fetchTokensFromBackend
        .mockResolvedValueOnce(mockTokens[0])
        .mockResolvedValueOnce(mockTokens[1])

      await tokenWorker.updateTokens()

      expect(mockNetworkService.get).toHaveBeenCalled()
      expect(mockTokenService.fetchTokensFromBackend).toHaveBeenCalledTimes(2)
      expect(mockTokenService.fetchTokensFromBackend).toHaveBeenNthCalledWith(
        1,
        mockNetworks[0].id,
      )
      expect(mockTokenService.fetchTokensFromBackend).toHaveBeenNthCalledWith(
        2,
        mockNetworks[1].id,
      )
      expect(mockTokenService.updateTokens).toHaveBeenCalledWith(
        mockTokens.flat(),
      )
    })
  })

  describe("updateTokenBalances", () => {
    it("should fetch token balances for the provided account and update the token service", async () => {
      // Arrange
      const mockAccount: BaseWalletAccount = {
        address: accountAddress1,
        networkId: "1" /* other properties */,
      }
      const mockBaseToken = getMockBaseToken({ networkId: "1" })
      const mockTokens: Token[] = [getMockToken({ networkId: "1" })]
      const mockTokensWithBalance: BaseTokenWithBalance[] = [
        {
          ...mockBaseToken,
          account: mockAccount,
          balance: "100",
        },
      ]
      mockTokenService.getTokens.mockResolvedValue(mockTokens)
      mockTokenService.fetchTokenBalancesFromOnChain.mockResolvedValue(
        mockTokensWithBalance,
      )

      // Act
      await tokenWorker.updateTokenBalances(mockAccount)

      // Assert
      expect(mockTokenService.getTokens).toHaveBeenCalledWith(
        expect.any(Function),
      )
      expect(
        mockTokenService.fetchTokenBalancesFromOnChain,
      ).toHaveBeenCalledWith([mockAccount], mockTokens)
      expect(mockTokenService.updateTokenBalances).toHaveBeenCalledWith(
        mockTokensWithBalance,
      )
    })

    it("should fetch token balances for all accounts on the current network and update the token service when no account is provided", async () => {
      const mockSelectedAccount: BaseWalletAccount = {
        address: accountAddress1,
        networkId: "1",
      }
      const mockAccounts: BaseWalletAccount[] = [mockSelectedAccount]
      const mockBaseToken = getMockBaseToken({ networkId: "1" })
      const mockTokens: Token[] = [getMockToken({ networkId: "1" })]
      const mockTokensWithBalances: BaseTokenWithBalance[] = [
        {
          ...mockBaseToken,
          account: mockSelectedAccount,
          balance: "100",
        },
      ]
      mockWalletStore.get = vi.fn().mockReturnValue(mockSelectedAccount)
      mockAccountService.get = vi.fn().mockResolvedValue(mockAccounts)
      mockTokenService.getTokens = vi.fn().mockResolvedValue(mockTokens)
      mockTokenService.fetchTokenBalancesFromOnChain = vi
        .fn()
        .mockResolvedValue(mockTokensWithBalances)

      await tokenWorker.updateTokenBalances()
      expect(mockWalletStore.get).toHaveBeenCalledWith("selected")
      expect(mockAccountService.get).toHaveBeenCalledWith(expect.any(Function))
      expect(mockTokenService.getTokens).toHaveBeenCalledWith(
        expect.any(Function),
      )
      expect(
        mockTokenService.fetchTokenBalancesFromOnChain,
      ).toHaveBeenCalledWith(mockAccounts, mockTokens)
      expect(mockTokenService.updateTokenBalances).toHaveBeenCalledWith(
        mockTokensWithBalances,
      )
    })
  })

  describe("updateTokenPrices", () => {
    it("should fetch token prices for the default network and update the token service", async () => {
      // Arrange
      const mockTokens: Token[] = [getMockToken()]
      const mockTokenPrices: TokenPriceDetails[] = [
        getMockTokenPriceDetails({ pricingId: 1 }),
      ]
      mockTokenService.getTokens.mockResolvedValue(mockTokens)
      mockTokenService.fetchTokenPricesFromBackend.mockResolvedValue(
        mockTokenPrices,
      )

      await tokenWorker.updateTokenPrices()

      // Assert
      expect(mockTokenService.getTokens).toHaveBeenCalledWith(
        expect.any(Function),
      )
      expect(mockTokenService.fetchTokenPricesFromBackend).toHaveBeenCalledWith(
        mockTokens,
        defaultNetwork.id,
      )
      expect(mockTokenService.updateTokenPrices).toHaveBeenCalledWith(
        mockTokenPrices,
      )
    })
  })

  describe("onOpened ", () => {
    it("should start the token worker schedule when opened", async () => {
      // Act
      tokenWorker.onOpened(true)

      // Assert
      expect(mockScheduleService.every).toHaveBeenCalledTimes(3)
      expect(mockScheduleService.every).toHaveBeenNthCalledWith(1, 86400, {
        id: TokenWorkerSchedule.updateTokens,
      })
      expect(mockScheduleService.every).toHaveBeenNthCalledWith(2, 20, {
        id: TokenWorkerSchedule.updateTokenBalances,
      })
      expect(mockScheduleService.every).toHaveBeenNthCalledWith(3, 60, {
        id: TokenWorkerSchedule.updateTokenPrices,
      })
    })

    it("should delete the token worker schedule when closed", async () => {
      // Act
      tokenWorker.onOpened(false)

      // Assert
      expect(mockScheduleService.delete).toHaveBeenCalledTimes(2)
      expect(mockScheduleService.delete).toHaveBeenNthCalledWith(1, {
        id: TokenWorkerSchedule.updateTokenBalances,
      })
      expect(mockScheduleService.delete).toHaveBeenNthCalledWith(2, {
        id: TokenWorkerSchedule.updateTokenPrices,
      })
    })
  })
})
