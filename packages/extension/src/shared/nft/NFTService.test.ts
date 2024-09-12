import { BackendNftService } from "@argent/x-shared"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { beforeEach, describe, expect, vi, Mocked } from "vitest"
import { NFTService } from "./NFTService"
import {
  emptyJson,
  expectedValidRes,
  expectedValidRes2Accounts,
  invalidJson,
  validJson,
} from "./__mocks__/nft.mock"
import { constants } from "starknet"
import {
  nftsCollectionsRepository,
  nftsContractsRepository,
  nftsRepository,
} from "./store"
import { networkService } from "../network/service"
import type { KeyValueStorage } from "../storage"
import type { ISettingsStorage } from "../settings/types"

const BASE_URL_ENDPOINT = "https://api.hydrogen.argent47.net/v1"
const INVALID_URL_ENDPOINT = BASE_URL_ENDPOINT + "INVALID"
const EMPTY_URL_ENDPOINT = BASE_URL_ENDPOINT + "EMPTY"
const BASE_URL_WITH_WILDCARD = BASE_URL_ENDPOINT + "*"

const server = setupServer(
  http.get(INVALID_URL_ENDPOINT, () => {
    return HttpResponse.json(invalidJson)
  }),
  http.get(EMPTY_URL_ENDPOINT, () => {
    return HttpResponse.json(emptyJson)
  }),
  http.get(BASE_URL_WITH_WILDCARD, () => {
    return HttpResponse.json(validJson)
  }),
)
beforeAll(() => {
  server.listen()
})

const repositorytMock = {
  get: vi.fn().mockResolvedValue(expectedValidRes),
  upsert: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
} as unknown as Mocked<typeof nftsRepository>

const repositoryCollectionsRepositoryMock = {
  get: vi.fn().mockResolvedValue(expectedValidRes),
  upsert: vi.fn().mockResolvedValue(undefined),
} as unknown as Mocked<typeof nftsCollectionsRepository>

const repositorytContractsMock = {
  get: vi.fn().mockResolvedValue(expectedValidRes),
  upsert: vi.fn().mockResolvedValue(undefined),
} as unknown as Mocked<typeof nftsContractsRepository>

const argentNftServiceMock = {
  getNfts: vi.fn().mockResolvedValue(validJson),
} as unknown as Mocked<BackendNftService>

const networkServiceMock = {
  getById: vi.fn().mockResolvedValue({
    name: "testnet",
    id: "sepolia-alpha",
    chainId: constants.StarknetChainId.SN_SEPOLIA,
    sequencerUrl: "https://alpha4.starknet.io",
  }),
} as unknown as Mocked<typeof networkService>

const settingsStoreMock = {
  get: vi.fn(),
} as unknown as KeyValueStorage<ISettingsStorage>

describe("NFTService", () => {
  let testClass: NFTService

  beforeEach(() => {
    testClass = new NFTService(
      networkServiceMock,
      repositorytMock,
      repositoryCollectionsRepositoryMock,
      repositorytContractsMock,
      argentNftServiceMock,
      settingsStoreMock,
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("getAssets", () => {
    it("should return nfts", async () => {
      const result = await testClass.getAssets(
        "starknet",
        "sepolia-alpha",
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
      )

      expect(result).toEqual(expectedValidRes)
    })
  })

  describe("upsert", () => {
    it("should return nfts", async () => {
      const result = await testClass.getAssets(
        "starknet",
        "sepolia-alpha",
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
      )

      expect(result).toEqual(expectedValidRes)

      await testClass.upsert(
        result,
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
        "sepolia-alpha",
      )

      expect(result).toEqual(expectedValidRes)
      expect(await repositorytMock.get()).toEqual(result)
      expect(await repositorytMock.get()).length(1)
    })
  })

  describe("upsert for different account", () => {
    it("should return nfts", async () => {
      const repositoryMock = {
        get: vi.fn().mockResolvedValue(expectedValidRes2Accounts),
        upsert: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn(),
      } as unknown as Mocked<typeof nftsRepository>

      const settingsStoreMock = {
        get: vi.fn(),
      } as unknown as KeyValueStorage<ISettingsStorage>

      const nftService = new NFTService(
        networkServiceMock,
        repositoryMock,
        repositoryCollectionsRepositoryMock,
        repositorytContractsMock,
        argentNftServiceMock,
        settingsStoreMock,
      )

      const result = await nftService.getAssets(
        "starknet",
        "sepolia-alpha",
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
      )

      await nftService.upsert(
        result,
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
        "sepolia-alpha",
      )

      expect(result).toEqual(expectedValidRes)
      expect(repositoryMock.remove).toHaveBeenCalled()
    })
  })
})
