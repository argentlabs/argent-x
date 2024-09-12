import "fake-indexeddb/auto"
import { Mocked } from "vitest"

import {
  Address,
  IHttpService,
  TXV3_ACCOUNT_CLASS_HASH,
  ETH_TOKEN_ADDRESS,
  STRK_TOKEN_ADDRESS,
  addressSchema,
  stripAddressZeroPadding,
} from "@argent/x-shared"
import { stark } from "starknet"
import { getMockNetwork } from "../../../../test/network.mock"
import {
  getMockBaseToken,
  getMockTokenWithBalance,
} from "../../../../test/token.mock"
import { AccountService } from "../../account/service/accountService/AccountService"
import { IAccountService } from "../../account/service/accountService/IAccountService"
import { StarknetChainService } from "../../chain/service/StarknetChainService"
import { ArgentDatabase } from "../../idb/db"
import { INetworkService } from "../../network/service/INetworkService"
import { NetworkService } from "../../network/service/NetworkService"
import { INetworkRepo } from "../../network/store"
import {
  MockFnObjectStore,
  MockFnRepository,
} from "../../storage/__new/__test__/mockFunctionImplementation"
import { TokenService } from "../../token/__new/service/TokenService"
import { ITransactionsRepository } from "../../transactions/store"
import { FeeTokenPreference } from "../types/preference.model"
import { FeeTokenService } from "./FeeTokenService"

const randomAddress1 = addressSchema.parse(stark.randomAddress())

const BASE_INFO_ENDPOINT = "https://token.info.argent47.net/v1"
const BASE_PRICES_ENDPOINT = "https://token.prices.argent47.net/v1"

describe("FeeTokenService", () => {
  let tokenService: TokenService
  let feeTokenService: FeeTokenService
  let mockNetworkService: Mocked<INetworkService>
  let mockTransactionsRepo: MockFnRepository<ITransactionsRepository>
  let mockNetworkRepo: MockFnRepository<INetworkRepo>
  let mockAccountService: Mocked<IAccountService>
  let mockFeeTokenPreferenceStore: MockFnObjectStore<FeeTokenPreference>
  let db: ArgentDatabase

  beforeEach(() => {
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

    db = new ArgentDatabase()

    tokenService = new TokenService(
      mockNetworkService,
      db,
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
    const mockNetwork = getMockNetwork()
    const mockAccount = {
      classHash: TXV3_ACCOUNT_CLASS_HASH as Address,
      address: randomAddress1,
      networkId: mockNetwork.id,
    }
    const mockBaseTokens = [
      getMockBaseToken({ networkId: mockNetwork.id }),
      getMockBaseToken({
        address: "0x4561234545442141232132132132132132132132131232144",
        networkId: mockNetwork.id,
      }),
    ]

    const mockTokens = [
      getMockTokenWithBalance({
        ...mockBaseTokens[0],
        symbol: "ETH",
        account: mockAccount,
        address: ETH_TOKEN_ADDRESS,
      }),
      getMockTokenWithBalance({
        ...mockBaseTokens[1],
        account: mockAccount,
      }),

      getMockTokenWithBalance({
        ...mockBaseTokens[1],
        symbol: "STRK",
        account: mockAccount,
        address: STRK_TOKEN_ADDRESS,
      }),
    ]

    const mockTokensWithBalance = [
      {
        balance: BigInt(10e17).toString(),
        account: mockAccount.address,
        address: addressSchema.parse(ETH_TOKEN_ADDRESS),
        networkId: mockNetwork.id,
      },
      {
        address: addressSchema.parse(mockBaseTokens[1].address),
        balance: BigInt(10e16).toString(),
        account: mockAccount.address,
        networkId: mockNetwork.id,
      },
      {
        balance: BigInt(20e18).toString(),
        account: mockAccount.address,
        address: addressSchema.parse(STRK_TOKEN_ADDRESS),
        networkId: mockNetwork.id,
      },
    ]

    mockNetworkService.getById = vi.fn().mockResolvedValueOnce(mockNetwork)

    await db.tokenBalances.bulkPut(mockTokensWithBalance)
    await db.tokens.bulkPut(mockTokens)

    mockTransactionsRepo.get.mockResolvedValueOnce([])

    const result = await feeTokenService.getFeeTokens(mockAccount)
    const mockFeeTokens = [mockTokens[2], mockTokens[0]].map((token) => {
      const tokensWithBalance = mockTokensWithBalance.find(
        (t) => t.address === token.address,
      )

      return {
        ...token,
        account: {
          address: tokensWithBalance?.account,
          networkId: token.networkId,
        },
        balance: tokensWithBalance?.balance,
      }
    })

    expect(result).toEqual(
      mockFeeTokens.map((token) => ({
        ...token,
        account: {
          ...token.account,
          address: stripAddressZeroPadding(token?.account?.address || ""),
        },
        address: stripAddressZeroPadding(token.address),
      })),
    )
  })

  test("should return the correct fee tokens given a mock account", async () => {
    const mockNetwork = getMockNetwork()
    const mockAccount = {
      classHash: TXV3_ACCOUNT_CLASS_HASH as Address,
      address: randomAddress1,
      networkId: mockNetwork.id,
    }
    const mockBaseTokens = [
      getMockBaseToken({ networkId: mockNetwork.id }),
      getMockBaseToken({ address: "0x456", networkId: mockNetwork.id }),
    ]

    const mockTokens = [
      getMockTokenWithBalance({
        ...mockBaseTokens[1],
        symbol: "STRK",
        account: mockAccount,
        address: STRK_TOKEN_ADDRESS,
      }),
      getMockTokenWithBalance({
        ...mockBaseTokens[0],
        account: mockAccount,
        symbol: "ETH",
        address: ETH_TOKEN_ADDRESS,
      }),
    ]

    const mockTokensWithBalance = [
      {
        balance: BigInt(20e18).toString(),
        account: mockAccount.address,
        address: addressSchema.parse(STRK_TOKEN_ADDRESS),
        networkId: mockNetwork.id,
      },
      {
        balance: BigInt(10e17).toString(),
        account: mockAccount.address,
        address: addressSchema.parse(ETH_TOKEN_ADDRESS),
        networkId: mockNetwork.id,
      },
    ]

    mockNetworkService.getById = vi.fn().mockResolvedValueOnce(mockNetwork)

    await db.tokenBalances.bulkPut(mockTokensWithBalance)
    await db.tokens.bulkPut(mockTokens)

    mockTransactionsRepo.get.mockResolvedValueOnce([])

    const result = await feeTokenService.getFeeTokens(mockAccount)

    const mockFeeTokens = mockTokens.map((token) => {
      const tokensWithBalance = mockTokensWithBalance.find(
        (t) => t.address === token.address,
      )

      return {
        ...token,
        account: {
          address: tokensWithBalance?.account,
          networkId: token.networkId,
        },
        balance: tokensWithBalance?.balance,
      }
    })
    expect(result).toEqual(
      mockFeeTokens.map((token) => ({
        ...token,
        account: {
          ...token.account,
          address: stripAddressZeroPadding(token?.account?.address || ""),
        },
        address: stripAddressZeroPadding(token.address),
      })),
    )
  })

  test("getBestFeeToken returns the correct fee token", async () => {
    const mockNetwork = getMockNetwork()
    const mockAccount = {
      classHash: "0x123" as Address,
      address: randomAddress1,
      networkId: mockNetwork.id,
    }
    const mockBaseTokens = [
      getMockBaseToken({ networkId: mockNetwork.id }),
      getMockBaseToken({
        address: "0x456123213422222233334445555343333334445555343322",
        networkId: mockNetwork.id,
      }),
    ]

    const mockTokens = [
      getMockTokenWithBalance({
        ...mockBaseTokens[0],
        account: mockAccount,
        address: ETH_TOKEN_ADDRESS,
      }),
      getMockTokenWithBalance({
        ...mockBaseTokens[1],
        account: mockAccount,
      }),
    ]

    const mockTokensWithBalance = [
      {
        balance: BigInt(10e17).toString(),
        account: mockAccount.address,
        address: addressSchema.parse(ETH_TOKEN_ADDRESS),
        networkId: mockNetwork.id,
      },
      {
        balance: BigInt(10e16).toString(),
        account: mockAccount.address,
        address: addressSchema.parse(mockBaseTokens[1].address),
        networkId: mockNetwork.id,
      },
    ]

    mockNetworkService.getById = vi.fn().mockResolvedValueOnce(mockNetwork)

    await db.tokenBalances.bulkPut(mockTokensWithBalance)
    await db.tokens.bulkPut(mockTokens)

    mockTransactionsRepo.get.mockResolvedValueOnce([])

    const result = await feeTokenService.getBestFeeToken(mockAccount)
    expect(result).toEqual({
      ...mockTokens[0],
      account: {
        address: stripAddressZeroPadding(mockAccount.address),
        networkId: mockTokens[0].networkId,
      },
      address: stripAddressZeroPadding(mockTokens[0].address),
      balance: mockTokensWithBalance[0].balance,
    })
  })

  test("getBestFeeToken returns the token with the highest balance", async () => {
    const mockNetwork = getMockNetwork()
    const mockAccount = {
      classHash: TXV3_ACCOUNT_CLASS_HASH as Address,
      address: randomAddress1,
      networkId: mockNetwork.id,
    }
    const mockBaseTokens = [
      getMockBaseToken({ networkId: mockNetwork.id }),
      getMockBaseToken({
        address: "0x456123213422222233334445555343333334445555343322",
        networkId: mockNetwork.id,
      }),
    ]

    const mockTokens = [
      getMockTokenWithBalance({
        ...mockBaseTokens[0],
        account: mockAccount,
        symbol: "ETH",
        address: ETH_TOKEN_ADDRESS,
      }),
      getMockTokenWithBalance({
        ...mockBaseTokens[1],
        symbol: "STRK",
        account: mockAccount,
        address: STRK_TOKEN_ADDRESS,
      }),
    ]

    const mockTokensWithBalance = [
      {
        account: mockAccount.address,
        networkId: mockNetwork.id,
        address: addressSchema.parse(ETH_TOKEN_ADDRESS),
        balance: BigInt(10e17).toString(),
      },
      {
        account: mockAccount.address,
        networkId: mockNetwork.id,
        address: addressSchema.parse(STRK_TOKEN_ADDRESS),
        balance: BigInt(10e18).toString(),
      },
    ]

    mockNetworkService.getById = vi.fn().mockResolvedValueOnce(mockNetwork)

    await db.tokenBalances.bulkPut(mockTokensWithBalance)
    await db.tokens.bulkPut(mockTokens)

    mockTransactionsRepo.get.mockResolvedValueOnce([])

    const result = await feeTokenService.getBestFeeToken(mockAccount)
    expect(result).toEqual({
      ...mockTokens[1],
      balance: mockTokensWithBalance[1].balance,
      address: stripAddressZeroPadding(mockTokens[1].address),
      account: {
        address: stripAddressZeroPadding(mockAccount.address),
        networkId: mockTokens[1].networkId,
      },
    })
  })
})
