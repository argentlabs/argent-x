import type { Mocked } from "vitest"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { InvestmentService } from "./InvestmentService"
import type {
  IHttpService,
  Investment,
  InvestmentsResponse,
} from "@argent/x-shared"
import { addressSchema } from "@argent/x-shared"
import { ArgentDatabase } from "../../../shared/idb/db"
import type { AccountInvestmentsWithUsdValue } from "../../../shared/investments/types"
import { stark } from "starknet"
import type { IStakingStore } from "../../../shared/staking/storage"
import type { KeyValueStorage } from "../../../shared/storage"
import type {
  IInvestmentsByPositionIdRepository,
  IInvestmentsRepository,
} from "../../../shared/investments/repository"

describe("InvestmentService", () => {
  let service: InvestmentService
  let mockHttpService: Mocked<IHttpService>
  let db: ArgentDatabase
  let mockInvestmentsRepo: IInvestmentsRepository
  let mockInvestmentsByPositionIdRepo: IInvestmentsByPositionIdRepository

  beforeEach(() => {
    mockHttpService = vi.mocked<IHttpService>({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })

    db = new ArgentDatabase({ skipAddressNormalizer: true })

    const stakingStore = {
      set: vi.fn(),
    }

    mockInvestmentsRepo = {
      get: vi.fn().mockReturnValue(Promise.resolve([])),
      upsert: vi.fn(),
      remove: vi.fn(),
      subscribe: vi.fn(),
      namespace: "local",
    }

    mockInvestmentsByPositionIdRepo = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      subscribe: vi.fn(),
      defaults: {},
      namespace: "local",
      areaName: "local",
    }

    service = new InvestmentService(
      "https://example.com/api",
      mockHttpService,
      db,
      stakingStore as unknown as KeyValueStorage<IStakingStore>,
      mockInvestmentsRepo,
      mockInvestmentsByPositionIdRepo,
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
    void db.delete()
  })

  describe("getAllInvestments", () => {
    it("should return investments from the API response", async () => {
      const mockInvestments = [
        { id: "1", category: "strkDelegatedStaking", name: "Investment 1" },
        { id: "2", category: "other", name: "Investment 2" },
      ] as Investment[]
      const mockResponse: InvestmentsResponse = { investments: mockInvestments }
      mockHttpService.get.mockResolvedValueOnce(mockResponse)

      const investments = await service.getAllInvestments()

      expect(investments).toEqual(mockInvestments)
      expect(mockHttpService.get).toHaveBeenCalledWith(
        "https://example.com/api/investments?chain=starknet&currency=USD&application=argentx",
      )
    })

    it("should return an empty array if the API response is empty", async () => {
      const mockResponse: InvestmentsResponse = { investments: [] }
      mockHttpService.get.mockResolvedValueOnce(mockResponse)

      const investments = await service.getAllInvestments()

      expect(investments).toEqual([])
    })
  })

  describe("updateInvestmentsForAccounts", () => {
    it("should update investments in the database for accounts with new or changed investments", async () => {
      const mockUpdates = [
        {
          address: "0x01",
          networkId: "starknet",
          defiDecomposition: [
            {
              dappId: "1",
              totalUsdValue: "1000",
              products: [
                {
                  type: "staking" as const,
                  productId: "123",
                  name: "Test Staking",
                  positions: [
                    {
                      id: "pos1",
                      apy: "10",
                      token: {
                        address: "0x02",
                        networkId: "starknet",
                        balance: "1000000",
                        usdValue: "1000",
                      },
                    },
                  ],
                  totalUsdValue: "1000",
                },
              ],
            },
          ],
          tokenBalances: [],
          liquidityTokens: [],
        },
        {
          address: "0x03",
          networkId: "starknet",
          defiDecomposition: [
            {
              dappId: "2",
              totalUsdValue: "2000",
              products: [
                {
                  type: "staking" as const,
                  productId: "456",
                  name: "Test Staking 2",
                  positions: [
                    {
                      id: "pos2",
                      apy: "20",
                      token: {
                        address: "0x04",
                        networkId: "starknet",
                        balance: "2000000",
                        usdValue: "2000",
                      },
                    },
                  ],
                  totalUsdValue: "2000",
                },
              ],
            },
          ],
          tokenBalances: [],
          liquidityTokens: [],
        },
      ] as AccountInvestmentsWithUsdValue[]

      // Mock the tokens and token prices for USD value computation
      vi.spyOn(db.tokens, "toArray").mockResolvedValue([])
      vi.spyOn(db.tokenPrices, "toArray").mockResolvedValue([])

      await service.updateInvestmentsForAccounts(mockUpdates)

      expect(mockInvestmentsRepo.upsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            address: mockUpdates[0].address,
            networkId: "starknet",
            tokenBalances: [
              {
                account: "0x01",
                address: "0x02",
                balance: "1000000",
                networkId: "starknet",
              },
            ],
            liquidityTokens: [],
          }),
          expect.objectContaining({
            address: mockUpdates[1].address,
            networkId: "starknet",
            tokenBalances: [
              {
                account: "0x03",
                address: "0x04",
                balance: "2000000",
                networkId: "starknet",
              },
            ],
            liquidityTokens: [],
          }),
        ]),
      )
    })

    it("should not update investments in the database if there are no changes", async () => {
      const address = addressSchema.parse(stark.randomAddress())
      const mockInvestment = {
        address,
        networkId: "starknet",
        defiDecomposition: [
          {
            dappId: "1",
            totalUsdValue: "1000",
            products: [
              {
                type: "staking" as const,
                productId: "123",
                name: "Test Staking",
                positions: [
                  {
                    id: "pos1",
                    apy: "10",
                    token: {
                      address: addressSchema.parse(stark.randomAddress()),
                      networkId: "starknet",
                      balance: "1000000",
                      usdValue: "1000",
                    },
                  },
                ],
                totalUsdValue: "1000",
              },
            ],
          },
        ],
        tokenBalances: [],
        liquidityTokens: [],
      } as AccountInvestmentsWithUsdValue

      vi.mocked(mockInvestmentsRepo.get).mockResolvedValueOnce([mockInvestment])

      await service.updateInvestmentsForAccounts([mockInvestment])

      expect(mockInvestmentsRepo.upsert).toHaveBeenCalledWith([])
      expect(mockInvestmentsByPositionIdRepo.set).not.toHaveBeenCalled()
    })
  })
})
