import { Mocked } from "vitest"
import { NetworkService } from "../../network/service/implementation"
import { INetworkService } from "../../network/service/interface"
import { INetworkRepo } from "../../network/store"
import {
  MockFnObjectStore,
  MockFnRepository,
} from "../../storage/__new/__test__/mockFunctionImplementation"
import { ITokenBalanceRepository } from "../../token/__new/repository/tokenBalance"
import { FeeTokenService } from "./implementation"
import { TokenService } from "../../token/__new/service/implementation"
import { ITokenRepository } from "../../token/__new/repository/token"
import { StarknetChainService } from "../../chain/service/implementation"
import { IAccountService } from "../../account/service/interface"
import { AccountService } from "../../account/service/implementation"
import {
  ETH_TOKEN_ADDRESS,
  STRK_TOKEN_ADDRESS,
  TXV3_ACCOUNT_CLASS_HASH,
} from "../../network/constants"
import { Address, IHttpService, addressSchema } from "@argent/shared"
import { stark } from "starknet"
import { defaultNetwork } from "../../network"
import { getMockNetwork } from "../../../../test/network.mock"
import {
  getMockBaseToken,
  getMockTokenWithBalance,
} from "../../../../test/token.mock"
import { ITransactionsRepository } from "../../transactions/store"
import { FeeTokenPreference } from "../types/preference.model"
import { ITokenPriceRepository } from "../../token/__new/repository/tokenPrice"

const randomAddress1 = addressSchema.parse(stark.randomAddress())

const BASE_INFO_ENDPOINT = "https://token.info.argent47.net/v1"
const BASE_PRICES_ENDPOINT = "https://token.prices.argent47.net/v1"

describe("FeeTokenService", () => {
  let tokenService: TokenService
  let feeTokenService: FeeTokenService
  let mockNetworkService: Mocked<INetworkService>
  let mockTokenRepo: MockFnRepository<ITokenRepository>
  let mockTokenBalanceRepo: MockFnRepository<ITokenBalanceRepository>
  let mockTokenPriceRepo: MockFnRepository<ITokenPriceRepository>
  let mockTransactionsRepo: MockFnRepository<ITransactionsRepository>
  let mockNetworkRepo: MockFnRepository<INetworkRepo>
  let mockAccountService: Mocked<IAccountService>
  let mockFeeTokenPreferenceStore: MockFnObjectStore<FeeTokenPreference>

  beforeEach(() => {
    mockTokenRepo = new MockFnRepository()
    mockTokenBalanceRepo = new MockFnRepository()
    mockTokenPriceRepo = new MockFnRepository()
    mockNetworkRepo = new MockFnRepository()
    mockTransactionsRepo = new MockFnRepository()

    mockNetworkService = vi.mocked<INetworkService>(
      new NetworkService(mockNetworkRepo),
    )
    const mockAccountRepo = new MockFnRepository()
    const chainService = new StarknetChainService(mockNetworkService)
    mockAccountService = vi.mocked<IAccountService>(
      new AccountService(chainService, mockAccountRepo),
    )
    mockFeeTokenPreferenceStore = new MockFnObjectStore()
    mockFeeTokenPreferenceStore.get = vi.fn().mockResolvedValue({
      prefer: STRK_TOKEN_ADDRESS,
    })

    const mockHttpService = {
      get: vi.fn(),
    } as unknown as Mocked<IHttpService>

    const mockTokenInfoStore = {
      namespace: "core:tokenInfo",
      get: vi.fn(),
      set: vi.fn(),
      subscribe: vi.fn(),
    }

    tokenService = new TokenService(
      mockNetworkService,
      mockTokenRepo,
      mockTokenBalanceRepo,
      mockTokenPriceRepo,
      mockTokenInfoStore,
      mockHttpService,
      BASE_INFO_ENDPOINT,
      BASE_PRICES_ENDPOINT,
    )

    feeTokenService = new FeeTokenService(
      tokenService,
      mockAccountService,
      mockNetworkService,
      mockFeeTokenPreferenceStore,
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test("getFeeTokens returns the correct fee tokens and respects order preference", async () => {
    const mockAccount = {
      classHash: TXV3_ACCOUNT_CLASS_HASH as Address,
      address: randomAddress1,
      networkId: defaultNetwork.id,
    }
    const mockNetwork = getMockNetwork()
    const mockBaseTokens = [
      getMockBaseToken({ networkId: mockNetwork.id }),
      getMockBaseToken({ address: "0x456", networkId: mockNetwork.id }),
    ]

    const mockTokens = [
      getMockTokenWithBalance({
        ...mockBaseTokens[0],
        symbol: "ETH",
        balance: BigInt(10e17).toString(),
        account: mockAccount,
        address: ETH_TOKEN_ADDRESS,
      }),
      getMockTokenWithBalance({
        ...mockBaseTokens[1],
        balance: BigInt(10e16).toString(),
        account: mockAccount,
      }),

      getMockTokenWithBalance({
        ...mockBaseTokens[1],
        balance: BigInt(20e18).toString(),
        symbol: "STRK",
        account: mockAccount,
        address: STRK_TOKEN_ADDRESS,
      }),
    ]

    mockNetworkService.getById = vi.fn().mockResolvedValueOnce(mockNetwork)
    mockTokenBalanceRepo.get.mockResolvedValueOnce(mockTokens)
    mockTokenRepo.get.mockResolvedValueOnce(mockTokens)
    mockTransactionsRepo.get.mockResolvedValueOnce([])

    const result = await feeTokenService.getFeeTokens(mockAccount)
    expect(result).toEqual([mockTokens[2], mockTokens[0]])
  })

  test("should return the correct fee tokens given a mock account", async () => {
    const mockAccount = {
      classHash: TXV3_ACCOUNT_CLASS_HASH as Address,
      address: randomAddress1,
      networkId: defaultNetwork.id,
    }
    const mockNetwork = getMockNetwork()
    const mockBaseTokens = [
      getMockBaseToken({ networkId: mockNetwork.id }),
      getMockBaseToken({ address: "0x456", networkId: mockNetwork.id }),
    ]

    const mockTokens = [
      getMockTokenWithBalance({
        ...mockBaseTokens[1],
        balance: BigInt(20e18).toString(),
        symbol: "STRK",
        account: mockAccount,
        address: STRK_TOKEN_ADDRESS,
      }),
      getMockTokenWithBalance({
        ...mockBaseTokens[0],
        balance: BigInt(10e17).toString(),
        account: mockAccount,
        symbol: "ETH",
        address: ETH_TOKEN_ADDRESS,
      }),
    ]

    mockNetworkService.getById = vi.fn().mockResolvedValueOnce(mockNetwork)
    mockTokenBalanceRepo.get.mockResolvedValueOnce(mockTokens)
    mockTokenRepo.get.mockResolvedValueOnce(mockTokens)
    mockTransactionsRepo.get.mockResolvedValueOnce([])

    const result = await feeTokenService.getFeeTokens(mockAccount)
    expect(result).toEqual(mockTokens)
  })

  test("getBestFeeToken returns the correct fee token", async () => {
    const mockAccount = {
      classHash: "0x123" as Address,
      address: randomAddress1,
      networkId: defaultNetwork.id,
    }
    const mockNetwork = getMockNetwork()
    const mockBaseTokens = [
      getMockBaseToken({ networkId: mockNetwork.id }),
      getMockBaseToken({ address: "0x456", networkId: mockNetwork.id }),
    ]

    const mockTokens = [
      getMockTokenWithBalance({
        ...mockBaseTokens[0],
        balance: BigInt(10e17).toString(),
        account: mockAccount,
        address: ETH_TOKEN_ADDRESS,
      }),
      getMockTokenWithBalance({
        ...mockBaseTokens[1],
        balance: BigInt(10e16).toString(),
        account: mockAccount,
      }),
    ]

    mockNetworkService.getById = vi.fn().mockResolvedValueOnce(mockNetwork)
    mockTokenBalanceRepo.get.mockResolvedValueOnce(mockTokens)
    mockTokenRepo.get.mockResolvedValueOnce(mockTokens)
    mockTransactionsRepo.get.mockResolvedValueOnce([])

    const result = await feeTokenService.getBestFeeToken(mockAccount)
    expect(result).toEqual(mockTokens[0])
  })

  test("getBestFeeToken returns the token with the highest balance", async () => {
    const mockAccount = {
      classHash: TXV3_ACCOUNT_CLASS_HASH as Address,
      address: randomAddress1,
      networkId: defaultNetwork.id,
    }
    const mockNetwork = getMockNetwork()
    const mockBaseTokens = [
      getMockBaseToken({ networkId: mockNetwork.id }),
      getMockBaseToken({ address: "0x456", networkId: mockNetwork.id }),
    ]

    const mockTokens = [
      getMockTokenWithBalance({
        ...mockBaseTokens[0],
        balance: BigInt(10e17).toString(),
        account: mockAccount,
        symbol: "ETH",
        address: ETH_TOKEN_ADDRESS,
      }),
      getMockTokenWithBalance({
        ...mockBaseTokens[1],
        balance: BigInt(10e18).toString(),
        symbol: "STRK",
        account: mockAccount,
        address: STRK_TOKEN_ADDRESS,
      }),
    ]

    mockNetworkService.getById = vi.fn().mockResolvedValueOnce(mockNetwork)
    mockTokenBalanceRepo.get.mockResolvedValueOnce(mockTokens)
    mockTokenRepo.get.mockResolvedValueOnce(mockTokens)
    mockTransactionsRepo.get.mockResolvedValueOnce([])

    const result = await feeTokenService.getBestFeeToken(mockAccount)
    expect(result).toEqual(mockTokens[1])
  })
})
