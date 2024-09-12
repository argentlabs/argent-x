import { describe, it, expect, beforeEach, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { useDappFromKnownDappsByHost } from "."
import { KnownDapp } from "@argent/x-shared"
import { useKnownDapps } from "./knownDapps"

// Mock the useKnownDapps hook
vi.mock("./knownDapps")

const mockKnownDapps: KnownDapp[] = [
  {
    name: "Vesu",
    dappUrl: "https://vesu.xyz/",
    argentVerified: true,
    executeFromOutsideAllowed: true,
    dappId: "vesu",
    brandColor: "#000000",
    categories: [],
    links: [],
    contracts: [],
    description: "",
    logoUrl: "",
    supportedApps: [],
    inAppBrowserCompatible: true,
  },
  {
    name: "Example",
    dappUrl: "https://example.com/",
    argentVerified: true,
    executeFromOutsideAllowed: true,
    dappId: "example",
    brandColor: "#000000",
    categories: [],
    links: [],
    contracts: [],
    description: "",
    logoUrl: "",
    supportedApps: [],
    inAppBrowserCompatible: true,
  },
  {
    name: "Test",
    dappUrl: "https://www.test.io/",
    argentVerified: true,
    executeFromOutsideAllowed: true,
    dappId: "test",
    brandColor: "#000000",
    categories: [],
    links: [],
    contracts: [],
    description: "",
    logoUrl: "",
    supportedApps: [],
    inAppBrowserCompatible: true,
  },
]

describe("useDappFromKnownDappsByHost", () => {
  beforeEach(() => {
    vi.mocked(useKnownDapps).mockReturnValue(mockKnownDapps)
  })

  it("should return the correct dapp for an exact match", () => {
    const { result } = renderHook(() =>
      useDappFromKnownDappsByHost("https://vesu.xyz/"),
    )

    expect(result.current).toEqual(mockKnownDapps[0])
  })

  it("should return the correct dapp when input has www and known dapp does not", () => {
    const { result } = renderHook(() =>
      useDappFromKnownDappsByHost("https://www.vesu.xyz/"),
    )
    expect(result.current).toEqual(mockKnownDapps[0])
  })

  it("should return the correct dapp when known dapp has www and input does not", () => {
    const { result } = renderHook(() =>
      useDappFromKnownDappsByHost("https://test.io/"),
    )
    expect(result.current).toEqual(mockKnownDapps[2])
  })

  it("should return undefined for an unknown host", () => {
    const { result } = renderHook(() =>
      useDappFromKnownDappsByHost("https://unknown.com/"),
    )
    expect(result.current).toBeUndefined()
  })

  it("should handle different protocols correctly", () => {
    const { result } = renderHook(() =>
      useDappFromKnownDappsByHost("http://vesu.xyz/"),
    )
    expect(result.current).toEqual(mockKnownDapps[0])
  })

  it("should handle subdomains correctly", () => {
    const { result } = renderHook(() =>
      useDappFromKnownDappsByHost("https://app.vesu.xyz/"),
    )
    expect(result.current).toBeUndefined()
  })

  it("should return undefined when knownDapps is null or undefined", () => {
    vi.mocked(useKnownDapps).mockReturnValue([])
    const { result } = renderHook(() =>
      useDappFromKnownDappsByHost("https://vesu.xyz/"),
    )
    expect(result.current).toBeUndefined()
  })
})
