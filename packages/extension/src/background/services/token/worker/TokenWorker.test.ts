import "fake-indexeddb/auto"
import type { IRepository } from "../../../../shared/storage/__new/interface"
import type { Mocked } from "vitest"
import type { INetworkService } from "../../../../shared/network/service/INetworkService"
import type { ITokenService } from "../../../../shared/token/__new/service/ITokenService"
import { TokenWorker } from "./TokenWorker"
import { MockFnRepository } from "../../../../shared/storage/__new/__test__/mockFunctionImplementation"
import type { WalletStorageProps } from "../../../../shared/wallet/walletStore"
import type { KeyValueStorage } from "../../../../shared/storage"
import type { Transaction } from "../../../../shared/transactions"
import type { Token } from "../../../../shared/token/__new/types/token.model"
import type { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import { recoverySharedServiceMock } from "../../../wallet/test.utils"
import type { IBackgroundUIService } from "../../ui/IBackgroundUIService"
import { getMockNetwork } from "../../../../../test/network.mock"
import {
  getMockApiTokenDetails,
  getMockBaseToken,
  getMockToken,
  getMockTokenPriceDetails,
} from "../../../../../test/token.mock"
import { addressSchema } from "@argent/x-shared"
import { stark } from "starknet"
import type { BaseWalletAccount } from "../../../../shared/wallet.model"
import { SignerType } from "../../../../shared/wallet.model"
import type { BaseTokenWithBalance } from "../../../../shared/token/__new/types/tokenBalance.model"
import type { TokenPriceDetails } from "../../../../shared/token/__new/types/tokenPrice.model"
import { defaultNetwork } from "../../../../shared/network"
import type { IDebounceService } from "../../../../shared/debounce"
import { getMockDebounceService } from "../../../../shared/debounce/mock"
import { createScheduleServiceMock } from "../../../../shared/schedule/mock"
import type { IActivityService } from "../../activity/IActivityService"
import { getAccountIdentifier } from "../../../../shared/utils/accountIdentifier"
import type { IAccountService } from "../../../../shared/account/service/accountService/IAccountService"
import { emitterMock } from "../../../../shared/test.utils"

const accountAddress1 = addressSchema.parse(stark.randomAddress())
const tokenAddress1 = addressSchema.parse(stark.randomAddress())
const tokenAddress2 = addressSchema.parse(stark.randomAddress())

const mockSigner = {
  type: SignerType.LOCAL_SECRET,
  derivationPath: "m/44'/60'/0'/0/0",
}

const accountId1 = getAccountIdentifier(
  accountAddress1,
  "sepolia-alpha",
  mockSigner,
)

describe("TokenWorker", () => {
  let tokenWorker: TokenWorker
  let mockAccountService: Mocked<IAccountService>
  let mockTokenService: Mocked<ITokenService>
  let mockNetworkService: Mocked<INetworkService>
  let mockWalletStore: KeyValueStorage<WalletStorageProps>
  let mockTransactionsRepo: IRepository<Transaction>
  let mockScheduleService: IScheduleService
  let mockBackgroundUIService: IBackgroundUIService
  let mockDebounceService: IDebounceService
  let mockActivityService: IActivityService

  beforeEach(() => {
    // Initialize mocks
    mockTokenService = {
      updateTokens: vi.fn(),
      addToken: vi.fn(),
      removeToken: vi.fn(),
      fetchTokenBalancesFromOnChain: vi.fn(),
      fetchTokenDetails: vi.fn(),
      fetchTokenPricesFromBackend: vi.fn(),
      getCurrencyValueForTokens: vi.fn(),
      getToken: vi.fn(),
      getAllTokenBalancesForAccount: vi.fn(),
      getTokenBalanceForAccount: vi.fn(),
      getTokens: vi.fn(),
      getTotalCurrencyBalanceForAccounts: vi.fn(),
      updateTokenBalances: vi.fn(),
      updateTokenPrices: vi.fn(),
      getFeeTokens: vi.fn(),
      getBestFeeToken: vi.fn(),
      fetchAccountTokenBalancesFromBackend: vi.fn(),
      getTokensInfoFromBackendForNetwork: vi.fn(),
      preferFeeToken: vi.fn(),
      getFeeTokenPreference: vi.fn(),
      getTokenInfo: vi.fn(),
    } as Mocked<ITokenService>

    mockAccountService = {
      get: vi.fn(),
      getArgentWalletAccounts: vi.fn(),
      emitter: emitterMock,
    } as unknown as Mocked<IAccountService>

    mockNetworkService = {
      get: vi.fn(),
      getById: vi.fn(),
    } as unknown as Mocked<INetworkService>

    mockWalletStore = {
      get: vi.fn(),
      set: vi.fn(),
      subscribe: vi.fn(),
    } as unknown as KeyValueStorage<WalletStorageProps>

    mockActivityService = {
      emitter: {
        on: vi.fn(),
      },
      updateSelectedAccountActivities: vi.fn(),
    } as unknown as IActivityService

    mockTransactionsRepo = new MockFnRepository()

    mockBackgroundUIService = {
      opened: true,
      emitter: emitterMock,
      openUiAndUnlock: vi.fn(),
      hasPopup: vi.fn(),
      closePopup: vi.fn(),
      openUi: vi.fn(),
      showNotification: vi.fn(),
      openUiAsFloatingWindow: vi.fn(),
    }

    const [, _mockScheduleService] = createScheduleServiceMock()
    mockScheduleService = _mockScheduleService

    mockDebounceService = getMockDebounceService()

    tokenWorker = new TokenWorker(
      mockWalletStore,
      mockAccountService,
      mockTransactionsRepo,
      mockTokenService,
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
        getMockNetwork({ id: "mainnet-alpha" }),
        getMockNetwork({ id: "invalid-backend-network" }),
      ]

      const mockTokens = [
        getMockToken({ address: tokenAddress1 }),
        getMockToken({ address: tokenAddress2 }),
      ]

      const mockApiTokens = [
        getMockApiTokenDetails({ address: tokenAddress1 }),
        getMockApiTokenDetails({ address: tokenAddress2 }),
      ]

      mockNetworkService.get.mockResolvedValue(mockNetworks)

      mockTokenService.getTokensInfoFromBackendForNetwork
        .mockResolvedValueOnce([mockApiTokens[0]])
        .mockResolvedValueOnce([mockApiTokens[1]])

      mockTokenService.getTokens
        .mockResolvedValueOnce([mockTokens[0]])
        .mockResolvedValueOnce([mockTokens[1]])

      await tokenWorker.refreshTokenRepoWithTokensInfoFromBackend()

      expect(mockNetworkService.get).toHaveBeenCalled()

      expect(
        mockTokenService.getTokensInfoFromBackendForNetwork,
      ).toHaveBeenCalledTimes(2)
      expect(
        mockTokenService.getTokensInfoFromBackendForNetwork,
      ).toHaveBeenNthCalledWith(1, mockNetworks[0].id)
      expect(
        mockTokenService.getTokensInfoFromBackendForNetwork,
      ).toHaveBeenNthCalledWith(2, mockNetworks[1].id)

      // merged tokens
      expect(mockTokenService.updateTokens).toHaveBeenNthCalledWith(1, [
        {
          ...mockApiTokens[0],
          ...mockTokens[0],
        },
      ])
      expect(mockTokenService.updateTokens).toHaveBeenNthCalledWith(2, [
        {
          ...mockApiTokens[1], // from api
          ...mockTokens[1],
        },
        {
          ...mockApiTokens[1], // from tradable
          ...mockTokens[1],
          networkId: "invalid-backend-network",
        },
      ])
    })
  })

  describe("updateTokenBalances", () => {
    it("should fetch token balances for the provided account and update the token service", async () => {
      // Arrange
      const mockAccount: BaseWalletAccount = {
        id: accountId1,
        address: accountAddress1,
        networkId: "1" /* other properties */,
      }
      const mockBaseToken = getMockBaseToken({ networkId: "1" })
      const mockTokens: Token[] = [getMockToken({ networkId: "1" })]
      const mockTokensWithBalance: BaseTokenWithBalance[] = [
        {
          ...mockBaseToken,
          account: mockAccount.address,
          balance: "100",
        },
      ]
      mockTokenService.getTokens.mockResolvedValue(mockTokens)
      mockTokenService.fetchTokenBalancesFromOnChain.mockResolvedValue(
        mockTokensWithBalance,
      )

      // Act
      await tokenWorker.updateTokenBalancesFromOnChain(mockAccount)

      // Assert
      expect(
        mockTokenService.fetchTokenBalancesFromOnChain,
      ).toHaveBeenCalledWith(mockAccount)
      expect(mockTokenService.updateTokenBalances).toHaveBeenCalledWith(
        mockTokensWithBalance,
      )
    })

    it("should fetch token balances for all accounts on the current network and update the token service when no account is provided", async () => {
      const mockSelectedAccount: BaseWalletAccount = {
        id: accountId1,
        address: accountAddress1,
        networkId: "sepolia-alpha",
      }
      const mockBaseToken = getMockBaseToken({ networkId: "sepolia-alpha" })
      const mockTokens: Token[] = [getMockToken({ networkId: "sepolia-alpha" })]
      const mockTokensWithBalances: BaseTokenWithBalance[] = [
        {
          ...mockBaseToken,
          account: mockSelectedAccount.address,
          balance: "100",
        },
      ]
      mockWalletStore.get = vi.fn().mockReturnValue(mockSelectedAccount)
      mockTokenService.getTokens = vi.fn().mockResolvedValue(mockTokens)
      mockTokenService.fetchTokenBalancesFromOnChain = vi
        .fn()
        .mockResolvedValue(mockTokensWithBalances)

      await tokenWorker.updateTokenBalancesFromOnChain()

      expect(mockWalletStore.get).toHaveBeenCalledWith("selected")
    })
  })

  it("should not fetch token balances from the backend if the selected network isnt support by backend", async () => {
    const mockSelectedAccount: BaseWalletAccount = {
      id: accountId1,
      address: accountAddress1,
      networkId: "insupportable",
    }
    const mockBaseToken = getMockBaseToken({ networkId: "1" })
    const mockTokens: Token[] = [getMockToken({ networkId: "1" })]
    const mockTokensWithBalances: BaseTokenWithBalance[] = [
      {
        ...mockBaseToken,
        account: mockSelectedAccount.address,
        balance: "100",
      },
    ]

    mockWalletStore.get = vi.fn().mockReturnValue(mockSelectedAccount)
    mockTokenService.getTokens = vi.fn().mockResolvedValue(mockTokens)
    mockTokenService.fetchTokenBalancesFromOnChain = vi
      .fn()
      .mockResolvedValue(mockTokensWithBalances)

    await tokenWorker.updateTokenBalancesFromOnChain()

    expect(mockWalletStore.get).toHaveBeenCalledWith("selected")
  })

  describe("updateTokenPrices", () => {
    it("should fetch token prices for the default network and update the token service", async () => {
      // Arrange
      const mockTokens: Token[] = [getMockToken()]
      const mockTokenPrices: TokenPriceDetails[] = [
        getMockTokenPriceDetails({ pricingId: 1 }),
      ]
      const mockNetworks = [
        getMockNetwork({ id: "mainnet-alpha" }),
        getMockNetwork({ id: "invalid-backend-network" }),
      ]

      mockNetworkService.get.mockResolvedValue(mockNetworks)
      mockTokenService.getTokens.mockResolvedValue(mockTokens)
      mockTokenService.fetchTokenPricesFromBackend.mockResolvedValue(
        mockTokenPrices,
      )

      await tokenWorker.runFetchAndUpdateTokensAndTokenPricesFromBackend()

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
