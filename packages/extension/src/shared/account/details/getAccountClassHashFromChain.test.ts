import { getAccountClassHashFromChain } from "./getAccountClassHashFromChain"
import { tryGetClassHash } from "./tryGetClassHashFromMulticall"
import { tryGetClassHashFromProvider } from "./tryGetClassHashFromProvider"
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
vi.mock("./tryGetClassHashFromMulticall")
vi.mock("./tryGetClassHashFromProvider")

const mockNetworkService = networkService as jest.Mocked<typeof networkService>
const mockGetMulticallForNetwork =
  getMulticallForNetwork as jest.MockedFunction<typeof getMulticallForNetwork>
const mockGetProvider = getProvider as jest.MockedFunction<typeof getProvider>
const mockTryGetClassHashFromMulticall = tryGetClassHash as jest.MockedFunction<
  typeof tryGetClassHash
>
const mockTryGetClassHashFromProvider =
  tryGetClassHashFromProvider as jest.MockedFunction<
    typeof tryGetClassHashFromProvider
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

    mockTryGetClassHashFromMulticall.mockResolvedValueOnce(
      STANDARD_ACCOUNT_CLASS_HASH,
    )

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

    expect(mockTryGetClassHashFromMulticall).toHaveBeenCalledWith(
      call,
      expect.objectContaining({
        callContract: expect.any(Function),
        getClassHashAt: expect.any(Function),
      }),
      STANDARD_ACCOUNT_CLASS_HASH,
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

    mockTryGetClassHashFromMulticall
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

    expect(mockTryGetClassHashFromMulticall).toHaveBeenNthCalledWith(
      1,
      first_call,
      expect.objectContaining({
        callContract: expect.any(Function),
        getClassHashAt: expect.any(Function),
      }),
      STANDARD_ACCOUNT_CLASS_HASH,
    )

    expect(mockTryGetClassHashFromMulticall).toHaveBeenNthCalledWith(
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

    const call = {
      contractAddress: accounts[0].address,
      entrypoint: "get_implementation",
    }

    mockTryGetClassHashFromProvider.mockResolvedValueOnce(
      STANDARD_ACCOUNT_CLASS_HASH,
    )

    mockGetProvider.mockReturnValueOnce({
      callContract: vi
        .fn()
        .mockResolvedValueOnce({ result: [STANDARD_ACCOUNT_CLASS_HASH] }),
      getClassHashAt: vi
        .fn()
        .mockResolvedValueOnce(STANDARD_ACCOUNT_CLASS_HASH),
    } as any)

    const results = await getAccountClassHashFromChain(accounts)

    expect(mockTryGetClassHashFromProvider).toBeCalledWith(
      call,
      mockGetProvider.mock.results[0].value,
    )
    expect(results[0].classHash).not.toBeUndefined()
    expect(results[0].classHash).toEqual(
      addressSchema.parse(STANDARD_ACCOUNT_CLASS_HASH),
    )
    expect(mockTryGetClassHashFromMulticall).not.toHaveBeenCalled()
    expect(results[0]).toEqual({
      address: accounts[0].address,
      networkId: accounts[0].networkId,
      type: "standard",
      classHash: addressSchema.parse(STANDARD_ACCOUNT_CLASS_HASH),
    })
  })
})
