import { IRepository } from "./../../../storage/__new/interface"
import { Mocked } from "vitest"
import { INetworkService } from "../../../network/service/interface"
import { ITokenService } from "../service/interface"
import { TokenWorker } from "./implementation"
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
import { IDebounceService } from "../../../debounce"
import { getMockDebounceService } from "../../../debounce/mock"
import { createScheduleServiceMock } from "../../../schedule/mock"
import { IActivityService } from "../../../../background/__new/services/activity/interface"
import { IActivityStorage } from "../../../activity/types"

const accountAddress1 = addressSchema.parse(stark.randomAddress())
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
  let mockScheduleService: IScheduleService
  let mockBackgroundUIService: IBackgroundUIService
  let mockDebounceService: IDebounceService
  let mockActivityService: IActivityService
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

    mockActivityService = {
      shouldUpdateBalance: vi.fn().mockResolvedValue({
        shouldUpdate: true,
        lastModified: 1234,
        id: "1234",
      }),
      addActivityToStore: vi.fn(),
    } as unknown as IActivityService

    mockTransactionsRepo = new MockFnRepository()
    mockTokenRepo = new MockFnRepository()

    mockBackgroundUIService = {
      opened: true,
      emitter: emitterMock,
      openUiAndUnlock: vi.fn(),
    }

    const [, _mockScheduleService] = createScheduleServiceMock()
    mockScheduleService = _mockScheduleService

    mockDebounceService = getMockDebounceService()

    tokenWorker = new TokenWorker(
      mockWalletStore,
      mockTransactionsRepo,
      mockTokenRepo,
      mockTokenService,
      mockAccountService,
      mockNetworkService,
      recoverySharedServiceMock,
      mockBackgroundUIService,
      mockScheduleService,
      mockDebounceService,
      mockActivityService,
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
      await tokenWorker.updateTokenBalancesForAccount(mockAccount)

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
        networkId: "goerli-alpha",
      }
      const mockAccounts: BaseWalletAccount[] = [mockSelectedAccount]
      const mockBaseToken = getMockBaseToken({ networkId: "goerli-alpha" })
      const mockTokens: Token[] = [getMockToken({ networkId: "goerli-alpha" })]
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
      expect(mockActivityService.addActivityToStore).toHaveBeenCalledWith({
        address: mockSelectedAccount.address,
        lastModified: 1234,
        id: "1234",
      })
    })
  })

  it("should not fetch token balances for all accounts on the current network and not update the token service if activity service returns false", async () => {
    const mockSelectedAccount: BaseWalletAccount = {
      address: accountAddress1,
      networkId: "goerli-alpha",
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
    mockActivityService.shouldUpdateBalance = vi
      .fn()
      .mockResolvedValue({ shouldUpdate: false })
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
    ).not.toHaveBeenCalled()
    expect(mockTokenService.updateTokenBalances).not.toHaveBeenCalledWith(
      mockTokensWithBalances,
    )
  })

  it("should not fetch token balances from the backend if the selected network isnt support by backend", async () => {
    const mockSelectedAccount: BaseWalletAccount = {
      address: accountAddress1,
      networkId: "insupportable",
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
    mockActivityService.shouldUpdateBalance = vi.fn().mockResolvedValue(false)
    mockWalletStore.get = vi.fn().mockReturnValue(mockSelectedAccount)
    mockAccountService.get = vi.fn().mockResolvedValue(mockAccounts)
    mockTokenService.getTokens = vi.fn().mockResolvedValue(mockTokens)
    mockTokenService.fetchTokenBalancesFromOnChain = vi
      .fn()
      .mockResolvedValue(mockTokensWithBalances)

    await tokenWorker.updateTokenBalances()

    expect(mockWalletStore.get).toHaveBeenCalledWith("selected")
    expect(mockAccountService.get).not.toHaveBeenCalledWith(
      expect.any(Function),
    )
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
})
