import {} from "vitest"
import { makeSafeNetworks } from "./makeSafeNetworks"

import { defaultNetworks } from "./defaults"
import type { Network } from "."
import { ETH_TOKEN_ADDRESS } from "./constants"

const legacyNetwork = {
  accountClassHash: {
    standard:
      "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003",
  },
  chainId: "SN_SEPOLIA",
  feeTokenAddress:
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  id: "sepolia",
  multicallAddress:
    "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
  name: "Sepolia",
  rpcUrl: "https://foo.bar",
} as unknown as Network

const legacyNetworkNoFeeToken = {
  accountClassHash: {
    standard:
      "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003",
  },
  chainId: "SN_SEPOLIA",
  id: "sepolia2",
  multicallAddress:
    "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
  name: "Sepolia 2",
  rpcUrl: "https://foo.bar",
} as unknown as Network

const invalidNetwork = {
  chainId: "SN_SEPOLIA",
  id: "sepolia3",
  name: "Sepolia 3",
} as unknown as Network

describe("shared/network/makeSafeNetworks", () => {
  describe("when valid", () => {
    test("returns unmodified networks", () => {
      expect(makeSafeNetworks(defaultNetworks)).toEqual(defaultNetworks)
    })
  })
  describe("when invalid", () => {
    test("returns modified, valid networks", () => {
      expect(
        makeSafeNetworks([
          legacyNetwork,
          legacyNetworkNoFeeToken,
          invalidNetwork,
        ]),
      ).toEqual([
        {
          accountClassHash: {
            standard:
              "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003",
          },
          chainId: "SN_SEPOLIA",
          id: "sepolia",
          multicallAddress:
            "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
          name: "Sepolia",
          possibleFeeTokenAddresses: [
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          ],
          rpcUrl: "https://foo.bar",
        },
        {
          accountClassHash: {
            standard:
              "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003",
          },
          chainId: "SN_SEPOLIA",
          id: "sepolia2",
          multicallAddress:
            "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
          name: "Sepolia 2",
          possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS],
          rpcUrl: "https://foo.bar",
        },
      ])
    })
  })
})
