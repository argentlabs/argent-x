import { describe, expect, test, vi } from "vitest"

import { getCallFromStarkName } from "../../getAddressFromStarkName"
import { ADDRESS_ERROR_MESSAGES } from "../../../../errors/address"
import { HttpError } from "../../../../http"
import { normalizeAddress } from "../../address"
import { StarknetAddressService } from "./StarknetAddressService"

describe("chains/starknet/address", () => {
  describe("StarknetAddressService", () => {
    const walletAddress =
      "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a"
    const makeService = (allowedArgentNameNetworkId = "goerli-alpha") => {
      const multicall = {
        callContract: vi.fn(),
      }
      const httpService = {
        get: vi.fn(),
      }
      const starknetAddressService = new StarknetAddressService(
        httpService,
        "https://foo.bar/v1/",
        allowedArgentNameNetworkId,
      )
      return {
        starknetAddressService,
        httpService,
        multicall,
      }
    }
    describe("parseAddressOrDomain", () => {
      describe("when valid", () => {
        test("returns normalized address", async () => {
          const { starknetAddressService, multicall } = makeService()
          const address = await starknetAddressService.parseAddressOrDomain(
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
            "goerli-alpha",
            multicall,
          )
          expect(address).toEqual(normalizeAddress(walletAddress))
        })
        test("returns normalized address for argent name", async () => {
          const { starknetAddressService, httpService, multicall } =
            makeService()
          httpService.get.mockResolvedValueOnce({
            walletAddress,
          })
          const address = await starknetAddressService.parseAddressOrDomain(
            "foo.argent.xyz",
            "goerli-alpha",
            multicall,
          )
          expect(httpService.get).toHaveBeenCalledWith(
            "https://foo.bar/v1/wallet?ens=foo.argent.xyz&chain=starknet",
          )
          expect(multicall.callContract).not.toHaveBeenCalled()
          expect(address).toEqual(normalizeAddress(walletAddress))
        })
      })
      describe("when invalid", () => {
        test("throws generic error when invalid", async () => {
          const { starknetAddressService, multicall } = makeService()
          await expect(
            starknetAddressService.parseAddressOrDomain(
              "foo",
              "goerli-alpha",
              multicall,
            ),
          ).rejects.toThrowError(ADDRESS_ERROR_MESSAGES.NOT_VALID)
        })
        test("throws generic error when not found", async () => {
          const { starknetAddressService, httpService, multicall } =
            makeService()
          httpService.get.mockImplementationOnce(() => {
            throw new HttpError("Not found", 404, { status: "notFound" })
          })
          await expect(
            starknetAddressService.parseAddressOrDomain(
              "foo.argent.xyz",
              "goerli-alpha",
              multicall,
            ),
          ).rejects.toThrowError(ADDRESS_ERROR_MESSAGES.NOT_VALID)
        })
      })
    })
    describe("getAddressFromDomainName", () => {
      describe("when valid", () => {
        test("returns normalized address for starknet id", async () => {
          const { starknetAddressService, httpService, multicall } =
            makeService()
          multicall.callContract.mockResolvedValueOnce({
            result: [walletAddress],
          })
          const address = await starknetAddressService.getAddressFromDomainName(
            "foo.stark",
            "goerli-alpha",
            multicall,
          )
          expect(httpService.get).not.toHaveBeenCalled()
          expect(multicall.callContract).toHaveBeenCalledWith(
            getCallFromStarkName("foo.stark", "goerli-alpha"),
          )
          expect(address).toEqual(normalizeAddress(walletAddress))
        })
        test("returns normalized address for argent name", async () => {
          const { starknetAddressService, httpService, multicall } =
            makeService()
          httpService.get.mockResolvedValueOnce({
            walletAddress,
          })
          const address = await starknetAddressService.getAddressFromDomainName(
            "foo.argent.xyz",
            "goerli-alpha",
            multicall,
          )
          expect(httpService.get).toHaveBeenCalledWith(
            "https://foo.bar/v1/wallet?ens=foo.argent.xyz&chain=starknet",
          )
          expect(multicall.callContract).not.toHaveBeenCalled()
          expect(address).toEqual(normalizeAddress(walletAddress))
        })
      })
      describe("when invalid", () => {
        test("throws generic domain error when invalid", async () => {
          const { starknetAddressService, multicall } = makeService()
          await expect(
            starknetAddressService.getAddressFromDomainName(
              "foo",
              "goerli-alpha",
              multicall,
            ),
          ).rejects.toThrowError(ADDRESS_ERROR_MESSAGES.NO_ADDRESS_FROM_DOMAIN)
        })
        test("throws argent name error when not found", async () => {
          const { starknetAddressService, httpService, multicall } =
            makeService()
          httpService.get.mockImplementationOnce(() => {
            throw new HttpError("Not found", 404, { status: "notFound" })
          })
          await expect(
            starknetAddressService.getAddressFromDomainName(
              "foo.argent.xyz",
              "goerli-alpha",
              multicall,
            ),
          ).rejects.toThrowError("foo.argent.xyz not found")
        })
        test("throws starknet id error when not found", async () => {
          const { starknetAddressService, multicall } = makeService()
          multicall.callContract.mockResolvedValueOnce({
            result: ["0x0"],
          })
          await expect(
            starknetAddressService.getAddressFromDomainName(
              "foo.stark",
              "goerli-alpha",
              multicall,
            ),
          ).rejects.toThrowError("foo.stark not found")
        })
      })
    })
  })
})
