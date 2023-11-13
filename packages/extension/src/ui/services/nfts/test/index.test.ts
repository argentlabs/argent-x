import { ArgentBackendNftService } from "@argent/shared"
import { rest } from "msw"
import { setupServer } from "msw/node"
import { beforeEach, describe, expect, vi } from "vitest"

import {
  nftsCollectionsRepository,
  nftsContractsRepository,
  nftsRepository,
} from "../../../../shared/storage/__new/repositories/nft"
import { messageClient } from "../../messaging/trpc"
import { NFTService } from "../implementation"
import {
  emptyJson,
  expectedValidRes,
  expectedValidRes2Accounts,
  invalidJson,
  validJson,
} from "./nft.mock"
import { constants } from "starknet"

const messageClientMock = {
  transfer: {
    send: {
      mutate: vi.fn().mockResolvedValue({
        hash: "0x123",
      }),
    },
  },
} as unknown as jest.Mocked<typeof messageClient>

const BASE_URL_ENDPOINT = "https://api.hydrogen.argent47.net/v1"
const INVALID_URL_ENDPOINT = BASE_URL_ENDPOINT + "INVALID"
const EMPTY_URL_ENDPOINT = BASE_URL_ENDPOINT + "EMPTY"
const BASE_URL_WITH_WILDCARD = BASE_URL_ENDPOINT + "*"

/**
 * @vitest-environment jsdom
 */

const server = setupServer(
  rest.get(INVALID_URL_ENDPOINT, (req, res, ctx) => {
    return res(ctx.json(invalidJson))
  }),
  rest.get(EMPTY_URL_ENDPOINT, (req, res, ctx) => {
    return res(ctx.json(emptyJson))
  }),
  rest.get(BASE_URL_WITH_WILDCARD, (req, res, ctx) => {
    return res(ctx.json(validJson))
  }),
)
beforeAll(() => {
  server.listen()
})

const repositorytMock = {
  get: vi.fn().mockResolvedValue(expectedValidRes),
  upsert: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
} as unknown as jest.Mocked<typeof nftsRepository>

const repositoryCollectionsRepositoryMock = {
  get: vi.fn().mockResolvedValue(expectedValidRes),
  upsert: vi.fn().mockResolvedValue(undefined),
} as unknown as jest.Mocked<typeof nftsCollectionsRepository>

const repositorytContractsMock = {
  get: vi.fn().mockResolvedValue(expectedValidRes),
  upsert: vi.fn().mockResolvedValue(undefined),
} as unknown as jest.Mocked<typeof nftsContractsRepository>

const argentNftServiceMock = {
  getNfts: vi.fn().mockResolvedValue(validJson),
} as unknown as jest.Mocked<ArgentBackendNftService>

describe("NFTService", () => {
  let testClass: NFTService

  beforeEach(() => {
    testClass = new NFTService(
      messageClientMock,
      repositorytMock,
      repositoryCollectionsRepositoryMock,
      repositorytContractsMock,
      argentNftServiceMock,
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("getAssets", () => {
    it("should return nfts", async () => {
      const result = await testClass.getAssets(
        "starknet",
        "goerli-alpha",
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
      )

      expect(result).toEqual(expectedValidRes)
    })
  })

  describe("upsert", () => {
    it("should return nfts", async () => {
      const result = await testClass.getAssets(
        "starknet",
        "goerli-alpha",
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
      )

      expect(result).toEqual(expectedValidRes)

      await testClass.upsert(
        result,
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
        "goerli-alpha",
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
      } as unknown as jest.Mocked<typeof nftsRepository>

      const nftService = new NFTService(
        messageClientMock,
        repositoryMock,
        repositoryCollectionsRepositoryMock,
        repositorytContractsMock,
        argentNftServiceMock,
      )

      const result = await nftService.getAssets(
        "starknet",
        "goerli-alpha",
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
      )

      await nftService.upsert(
        result,
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
        "goerli-alpha",
      )

      expect(result).toEqual(expectedValidRes)
      expect(repositoryMock.remove).toHaveBeenCalled()
    })
  })

  describe("transferNft", () => {
    it("should return nfts", async () => {
      const result = await testClass.getAssets(
        "starknet",
        "goerli-alpha",
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
      )

      expect(result).toEqual(expectedValidRes)
      await testClass.upsert(result, "0x123", "goerli-alpha")

      messageClientMock.transfer.send.mutate = vi
        .fn()
        .mockResolvedValue("0x999")

      const txHash = await testClass.transferNft(
        "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
        "0x070C58360B2493D3Ab8C42f8f66Df15fcFc3B77E76bAc1C690E68819B5511911",
        "0x070C58360B2493D3Ab8C42f8f66Df15fcFc3B77E76bAc1C690E68819B5511911",
        "854406733492",
        "ERC721",
        {
          name: "testnet",
          id: "goerli-alpha",
          chainId: constants.StarknetChainId.SN_GOERLI,
          sequencerUrl: "https://alpha4.starknet.io",
        },
      )

      expect(txHash).toEqual("0x999")
    })

    it("should throw error for contract address", async () => {
      const result = await testClass.getAssets(
        "starknet",
        "goerli-alpha",
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
      )

      expect(result).toEqual(expectedValidRes)
      await testClass.upsert(result, "0x123", "goerli-alpha")

      messageClientMock.transfer.send.mutate = vi
        .fn()
        .mockResolvedValue("0x999")

      await expect(
        testClass.transferNft(
          "0x0798e884450c19e072d6620fefdbeb738",
          "0x070C58360B2493D3Ab8C42f8f66Df15fcFc3B77E76bAc1C690E68819B5511911",
          "0x070C58360B2493D3Ab8C42f8f66Df15fcFc3B77E76bAc1C690E68819B5511911",
          "854406733492",
          "ERC721",
          {
            name: "testnet",
            id: "goerli-alpha",
            chainId: constants.StarknetChainId.SN_GOERLI,
            sequencerUrl: "https://alpha4.starknet.io",
          },
        ),
      ).rejects.toThrow(`Invalid address`)
    })

    it("should throw error for account address", async () => {
      const result = await testClass.getAssets(
        "starknet",
        "goerli-alpha",
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
      )

      expect(result).toEqual(expectedValidRes)
      await testClass.upsert(result, "0x123", "goerli-alpha")

      messageClientMock.transfer.send.mutate = vi
        .fn()
        .mockResolvedValue("0x999")

      await expect(
        testClass.transferNft(
          "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
          "0x070C58360B2493D3Ab8C42f8f66Df",
          "0x070C58360B2493D3Ab8C42f8f66Df15fcFc3B77E76bAc1C690E68819B5511911",
          "854406733492",
          "ERC721",
          {
            name: "testnet",
            id: "goerli-alpha",
            chainId: constants.StarknetChainId.SN_GOERLI,
            sequencerUrl: "https://alpha4.starknet.io",
          },
        ),
      ).rejects.toThrow(`Invalid address`)
    })

    it("should throw error for invalid recipient", async () => {
      const result = await testClass.getAssets(
        "starknet",
        "goerli-alpha",
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
      )

      expect(result).toEqual(expectedValidRes)
      await testClass.upsert(result, "0x123", "goerli-alpha")

      messageClientMock.transfer.send.mutate = vi
        .fn()
        .mockResolvedValue("0x999")

      await expect(
        testClass.transferNft(
          "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
          "0x070C58360B2493D3Ab8C42f8f66Df15fcFc3B77E76bAc1C690E68819B5511911",
          "0x070C58360B2493D3Ab8",
          "854406733492",
          "ERC721",
          {
            name: "testnet",
            id: "goerli-alpha",
            chainId: constants.StarknetChainId.SN_GOERLI,
            sequencerUrl: "https://alpha4.starknet.io",
          },
        ),
      ).rejects.toThrow("Invalid address")
    })
  })
})
