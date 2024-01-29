import { Mocked, MockedFunction } from "vitest"
import { getAccountClassHashFromChain } from "./getAccountClassHashFromChain"
import { tryGetClassHash } from "./tryGetClassHash"
import { networkService } from "../../network/service"
import { getProvider } from "../../network"
import { getMulticallForNetwork } from "../../multicall"
import { getMockWalletAccount } from "../../../../test/walletAccount.mock"
import {
  MULTISIG_ACCOUNT_CLASS_HASH,
  STANDARD_ACCOUNT_CLASS_HASH,
} from "../../network/constants"
import { addressSchema } from "@argent/shared"
import {
  getMockNetwork,
  getMockNetworkWithoutMulticall,
} from "../../../../test/network.mock"

vi.mock("../../network/service")
vi.mock("../../multicall")
vi.mock("../../network")
vi.mock("./tryGetClassHash")

const mockNetworkService = networkService as Mocked<typeof networkService>
const mockGetMulticallForNetwork = getMulticallForNetwork as MockedFunction<
  typeof getMulticallForNetwork
>
const mockGetProvider = getProvider as MockedFunction<typeof getProvider>
const mockTryGetClassHash = tryGetClassHash as MockedFunction<
  typeof tryGetClassHash
>

describe("getAccountClassHashFromChain", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should get account info when multicallAddress is defined", async () => {
    const mockNetwork = getMockNetwork()

    mockNetworkService.getById.mockResolvedValueOnce({
      ...mockNetwork,
      accountClassHash: {
        standard: STANDARD_ACCOUNT_CLASS_HASH,
      },
    })

    const accounts = [
      getMockWalletAccount({
        networkId: mockNetwork.id,
        network: mockNetwork,
        classHash: undefined,
      }),
    ]

    mockTryGetClassHash.mockResolvedValueOnce(STANDARD_ACCOUNT_CLASS_HASH)

    const call = {
      contractAddress: accounts[0].address,
      entrypoint: "get_implementation",
    }

    mockGetMulticallForNetwork.mockReturnValueOnce({
      callContract: vi
        .fn()
        .mockResolvedValueOnce([STANDARD_ACCOUNT_CLASS_HASH]),
    } as any)

    mockGetProvider.mockReturnValueOnce({
      getClassHashAt: vi
        .fn()
        .mockResolvedValueOnce(STANDARD_ACCOUNT_CLASS_HASH),
    } as any)

    const results = await getAccountClassHashFromChain(accounts)

    expect(results[0].classHash).not.toBeUndefined()
    expect(results[0].classHash).toEqual(
      addressSchema.parse(STANDARD_ACCOUNT_CLASS_HASH),
    )

    expect(mockTryGetClassHash).toHaveBeenCalledWith(
      call,
      expect.objectContaining({
        callContract: expect.any(Function),
        getClassHashAt: expect.any(Function),
      }),
      "standard",
    )

    expect(results[0]).toEqual({
      address: accounts[0].address,
      networkId: accounts[0].networkId,
      type: "standard",
      classHash: addressSchema.parse(STANDARD_ACCOUNT_CLASS_HASH),
    })
  })

  it("should correctly use fallback classhash, when not deployed", async () => {
    const mockNetwork = getMockNetwork()

    mockNetworkService.getById.mockResolvedValueOnce({
      ...mockNetwork,
      accountClassHash: {
        standard: STANDARD_ACCOUNT_CLASS_HASH,
        multisig: MULTISIG_ACCOUNT_CLASS_HASH,
      },
    })

    const accounts = [
      getMockWalletAccount({
        address: "0x01",
        networkId: mockNetwork.id,
        network: mockNetwork,
        classHash: STANDARD_ACCOUNT_CLASS_HASH,
      }),
      getMockWalletAccount({
        address: "0x02",
        networkId: mockNetwork.id,
        network: mockNetwork,
        classHash: MULTISIG_ACCOUNT_CLASS_HASH,
        type: "multisig",
      }),
    ]

    mockTryGetClassHash
      .mockResolvedValueOnce(STANDARD_ACCOUNT_CLASS_HASH)
      .mockResolvedValueOnce(MULTISIG_ACCOUNT_CLASS_HASH)

    const first_call = {
      contractAddress: accounts[0].address,
      entrypoint: "get_implementation",
    }

    const second_call = {
      contractAddress: accounts[1].address,
      entrypoint: "get_implementation",
    }

    mockGetMulticallForNetwork.mockReturnValueOnce({
      callContract: vi
        .fn()
        .mockResolvedValueOnce([STANDARD_ACCOUNT_CLASS_HASH]),
    } as any)

    mockGetProvider.mockReturnValueOnce({
      getClassHashAt: vi
        .fn()
        .mockResolvedValueOnce(STANDARD_ACCOUNT_CLASS_HASH),
    } as any)

    const results = await getAccountClassHashFromChain(accounts)

    expect(results[0].classHash).not.toBeUndefined()
    expect(results[0].classHash).toEqual(
      addressSchema.parse(STANDARD_ACCOUNT_CLASS_HASH),
    )

    expect(results[1].classHash).not.toBeUndefined()
    expect(results[1].classHash).toEqual(
      addressSchema.parse(MULTISIG_ACCOUNT_CLASS_HASH),
    )

    expect(mockTryGetClassHash).toHaveBeenNthCalledWith(
      1,
      first_call,
      expect.objectContaining({
        callContract: expect.any(Function),
        getClassHashAt: expect.any(Function),
      }),
      STANDARD_ACCOUNT_CLASS_HASH,
    )

    expect(mockTryGetClassHash).toHaveBeenNthCalledWith(
      2,
      second_call,
      expect.objectContaining({
        callContract: expect.any(Function),
        getClassHashAt: expect.any(Function),
      }),
      MULTISIG_ACCOUNT_CLASS_HASH,
    )

    expect(results[0]).toEqual({
      address: accounts[0].address,
      networkId: accounts[0].networkId,
      type: "standard",
      classHash: addressSchema.parse(STANDARD_ACCOUNT_CLASS_HASH),
    })

    expect(results[1]).toEqual({
      address: accounts[1].address,
      networkId: accounts[1].networkId,
      type: "multisig",
      classHash: addressSchema.parse(MULTISIG_ACCOUNT_CLASS_HASH),
    })
  })

  it("should get account info when multicallAddress is undefined", async () => {
    const mockNetwork = getMockNetworkWithoutMulticall()

    mockNetworkService.getById.mockResolvedValueOnce({
      ...mockNetwork,
      accountClassHash: {
        standard: STANDARD_ACCOUNT_CLASS_HASH,
      },
    })

    const accounts = [
      getMockWalletAccount({
        networkId: mockNetwork.id,
        network: mockNetwork,
        classHash: undefined,
      }),
    ]

    mockGetProvider.mockReturnValueOnce({
      callContract: vi
        .fn()
        .mockResolvedValueOnce({ result: [STANDARD_ACCOUNT_CLASS_HASH] }),
      getClassHashAt: vi
        .fn()
        .mockResolvedValueOnce(STANDARD_ACCOUNT_CLASS_HASH),
    } as any)
    mockTryGetClassHash.mockResolvedValueOnce(STANDARD_ACCOUNT_CLASS_HASH)

    const results = await getAccountClassHashFromChain(accounts)

    expect(results[0].classHash).not.toBeUndefined()
    expect(results[0].classHash).toEqual(
      addressSchema.parse(STANDARD_ACCOUNT_CLASS_HASH),
    )
    expect(mockTryGetClassHash).toHaveBeenCalledTimes(1)
    expect(results[0]).toEqual({
      address: accounts[0].address,
      networkId: accounts[0].networkId,
      type: "standard",
      classHash: addressSchema.parse(STANDARD_ACCOUNT_CLASS_HASH),
    })
  })
})
