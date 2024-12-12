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
import type { AccountInvestments } from "../../../shared/investments/types"
import { stark } from "starknet"
import type { IStakingStore } from "../../../shared/staking/storage"
import type { KeyValueStorage } from "../../../shared/storage"

describe("InvestmentService", () => {
  let service: InvestmentService
  let mockHttpService: Mocked<IHttpService>
  let db: ArgentDatabase

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

    service = new InvestmentService(
      "https://example.com/api",
      mockHttpService,
      db,
      stakingStore as unknown as KeyValueStorage<IStakingStore>,
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
          address: addressSchema.parse(stark.randomAddress()),
          networkId: "starknet",
          defiDecomposition: [
            { dappId: "1", products: [{ productId: "123" }] },
          ],
        },
        {
          address: addressSchema.parse(stark.randomAddress()),
          networkId: "starknet",
          defiDecomposition: [
            { dappId: "2", products: [{ productId: "456" }] },
          ],
        },
      ] as AccountInvestments[]

      await service.updateInvestmentsForAccounts(mockUpdates)

      const updatedInvestments = await db.investments.toArray()
      expect(updatedInvestments).toEqual(expect.arrayContaining(mockUpdates))
    })

    it("should not update investments in the database if there are no changes", async () => {
      const address = addressSchema.parse(stark.randomAddress())

      const mockUpdates = [
        {
          address,
          networkId: "starknet",
          defiDecomposition: [
            { dappId: "1", products: [{ productId: "123" }] },
          ],
        },
      ] as AccountInvestments[]
      const existingInvestment = {
        address,
        networkId: "starknet",
        defiDecomposition: [{ dappId: "1", products: [{ productId: "123" }] }],
      } as AccountInvestments
      await db.investments.put(existingInvestment)

      await service.updateInvestmentsForAccounts(mockUpdates)

      const dbPutSpy = vi.spyOn(db.investments, "put")

      expect(dbPutSpy).not.toHaveBeenCalled()
      const updatedInvestments = await db.investments.toArray()
      expect(updatedInvestments).toEqual(expect.arrayContaining(mockUpdates))
    })
  })
})
