import { describe, it, expect, vi, beforeEach } from "vitest"
import useValidateOutsideExecution from "./useValidateOutsideExecution"
import type { TypedData } from "@starknet-io/types-js"
import type { Network } from "../../../../../shared/network"
import { constants, stark } from "starknet"
import * as knownDappsService from "../../../../services/knownDapps"
import type { KnownDapp } from "@argent/x-shared"

vi.mock("../../../../services/knownDapps", () => ({
  useDappFromKnownDappsByHost: vi.fn(),
}))

describe("useValidateOutsideExecution", () => {
  const callerAddress = stark.randomAddress()
  const toAddress = stark.randomAddress()
  const mockDataToSign: TypedData = {
    domain: {
      name: "Account.execute_from_outside",
      chainId: constants.StarknetChainId.SN_SEPOLIA,
    },
    message: {
      caller: callerAddress,
      nonce: 15,
      execute_before: "0xfee3", // 40707
      execute_after: "0xfee9", // 40713
      calls: [
        {
          to: toAddress,
          selector: "0x000000",
          calldata_len: 1,
          calldata: ["0x0000000"],
        },
      ],
    },
    types: {},
    primaryType: "OutsideExecution",
  }

  const mockNetwork = {
    chainId: constants.StarknetChainId.SN_SEPOLIA,
  } as Network

  const mockMainnetNetwork = {
    chainId: constants.StarknetChainId.SN_MAIN,
  } as Network

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return false if network is not provided", () => {
    const result = useValidateOutsideExecution(
      mockDataToSign,
      "https://example.com",
    )
    expect(result).toBe(false)
  })

  it("should return true for valid non-mainnet execution", () => {
    vi.mocked(knownDappsService.useDappFromKnownDappsByHost).mockReturnValue({
      dappUrl: "https://example.com",
      executeFromOutsideAllowed: true,
    } as KnownDapp)

    const result = useValidateOutsideExecution(
      mockDataToSign,
      "https://example.com",
      mockNetwork,
    )
    expect(result).toBe(true)
  })

  it("should return false for invalid message", () => {
    vi.mocked(knownDappsService.useDappFromKnownDappsByHost).mockReturnValue({
      dappUrl: "https://example.com",
      executeFromOutsideAllowed: true,
    } as KnownDapp)

    const mismatchedTypedData = {
      ...mockDataToSign,
      message: {
        caller: 10, // not an address, will fail schema parsing
      },
    }

    const result = useValidateOutsideExecution(
      mismatchedTypedData,
      "https://example.com",
      mockNetwork,
    )
    expect(result).toBe(false)
  })

  it("should return false for mismatched chainId", () => {
    vi.mocked(knownDappsService.useDappFromKnownDappsByHost).mockReturnValue({
      dappUrl: "https://example.com",
      executeFromOutsideAllowed: true,
    } as KnownDapp)

    const mismatchedTypedData = {
      ...mockDataToSign,
      domain: { ...mockDataToSign.domain, chainId: "WRONG_CHAIN" },
    }
    const result = useValidateOutsideExecution(
      mismatchedTypedData,
      "https://example.com",
      mockNetwork,
    )
    expect(result).toBe(false)
  })

  it("should return false for mainnet with non-whitelisted host", () => {
    vi.mocked(knownDappsService.useDappFromKnownDappsByHost).mockReturnValue({
      dappUrl: "https://example.com",
      executeFromOutsideAllowed: true,
    } as KnownDapp)

    const result = useValidateOutsideExecution(
      mockDataToSign,
      "https://malicious.com",
      mockMainnetNetwork,
    )
    expect(result).toBe(false)
  })

  it("should return false for mainnet with whitelisted host but with mismatch chainId", () => {
    vi.mocked(knownDappsService.useDappFromKnownDappsByHost).mockReturnValue({
      dappUrl: "https://example.com",
      executeFromOutsideAllowed: true,
    } as KnownDapp)

    const result = useValidateOutsideExecution(
      mockDataToSign,
      "https://example.com",
      mockMainnetNetwork,
    )
    expect(result).toBe(false)
  })

  it("should return true for mainnet with whitelisted host", () => {
    vi.mocked(knownDappsService.useDappFromKnownDappsByHost).mockReturnValue({
      dappUrl: "https://example.com",
      executeFromOutsideAllowed: true,
    } as KnownDapp)

    const mismatchedTypedData = {
      ...mockDataToSign,
      domain: {
        ...mockDataToSign.domain,
        chainId: constants.StarknetChainId.SN_MAIN,
      },
    }

    const result = useValidateOutsideExecution(
      mismatchedTypedData,
      "https://example.com",
      mockMainnetNetwork,
    )
    expect(result).toBe(true)
  })

  it("should return false for mainnet without whitelisted host", () => {
    vi.mocked(knownDappsService.useDappFromKnownDappsByHost).mockReturnValue({
      dappUrl: "https://example.com",
      executeFromOutsideAllowed: false,
    } as KnownDapp)

    const result = useValidateOutsideExecution(
      mockDataToSign,
      "https://example.com",
      mockMainnetNetwork,
    )
    expect(result).toBe(false)
  })

  it("should return false for invalid URL", () => {
    vi.mocked(knownDappsService.useDappFromKnownDappsByHost).mockReturnValue({
      dappUrl: "https://example.com",
      executeFromOutsideAllowed: true,
    } as KnownDapp)

    const result = useValidateOutsideExecution(
      mockDataToSign,
      "invalid-url",
      mockMainnetNetwork,
    )
    expect(result).toBe(false)
  })
})
