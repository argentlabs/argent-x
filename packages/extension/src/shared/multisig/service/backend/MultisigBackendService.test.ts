import { constants, stark } from "starknet"
import { MockedFunction } from "vitest"
import { getMockNetwork } from "../../../../../test/network.mock"
import {
  ApiMultisigAccountData,
  ApiMultisigDataForSigner,
  ApiMultisigGetTransactionRequests,
  ApiMultisigTransactionResponse,
} from "../../multisig.model"
import { MultisigBackendService } from "./MultisigBackendService"
import { getMultisigAccountFromBaseWallet } from "../../utils/baseMultisig"
import { getMockAccount } from "../../../../../test/account.mock"
import { chainIdToStarknetNetwork } from "../../../utils/starknetNetwork"
import { addressSchema } from "@argent/x-shared"

vi.mock("../../utils/baseMultisig")
vi.mock("../../pendingTransactionsStore")
const addToMultisigPendingTransactionsSpy = vi.fn()
const convertToTransactionSpy = vi.fn()

const mockGetMultisigAccountFromBaseWallet =
  getMultisigAccountFromBaseWallet as MockedFunction<
    typeof getMultisigAccountFromBaseWallet
  >

const address = addressSchema.parse(stark.randomAddress())
const creator = addressSchema.parse(stark.randomAddress())

describe("MultisigBackendService", () => {
  const mockFetcher = vi.fn()
  let mockCurrentTime

  afterEach(() => {
    vi.clearAllMocks()
  })
  beforeEach(() => {
    mockCurrentTime = 1618491623961 // Example timestamp
    vi.spyOn(Date, "now").mockReturnValue(mockCurrentTime)
  })
  describe("constructor", () => {
    it("should throw an error if no baseUrl is provided", () => {
      expect(() => new MultisigBackendService()).toThrowError(
        "No multisig base url provided",
      )
    })

    it("should instantiate with provided baseUrl", () => {
      const service = new MultisigBackendService("http://example.com")
      expect(service.baseUrl).toBe("http://example.com")
    })
  })

  describe("fetchMultisigDataForSigner", () => {
    it("should correctly construct the URL and fetch the multisig data for the right signer", async () => {
      mockFetcher.mockResolvedValueOnce({
        totalPages: 1,
        totalElements: 1,
        size: 1,
        content: [
          {
            address,
            creator,
            signers: ["0x789"],
            threshold: 1,
          },
        ],
      } as ApiMultisigDataForSigner)
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
      )
      const signerName = "someSigner"

      const response = await service.fetchMultisigDataForSigner({
        signer: signerName,
        network: getMockNetwork(),
      })
      expect(mockFetcher).toHaveBeenCalledWith(
        `http://example.com/sepolia?signer=${signerName}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "argent-client": "argent-x",
            "argent-version": "Unknown version",
          },
          method: "GET",
          body: undefined,
        },
      )
      expect(response).toEqual({
        totalPages: 1,
        totalElements: 1,
        size: 1,
        content: [
          {
            address,
            creator,
            signers: ["0x789"],
            threshold: 1,
          },
        ],
      })

      expect(mockFetcher).toHaveBeenCalledTimes(1)
    })
    it("should throw on error", async () => {
      mockFetcher.mockRejectedValueOnce(new Error("some error"))
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
      )
      const signerName = "someSigner"

      await expect(
        service.fetchMultisigDataForSigner({
          signer: signerName,
          network: getMockNetwork(),
        }),
      ).rejects.toThrowError("An error occured Error: some error")
    })
  })

  describe("fetchMultisigAccountData", () => {
    it("should call the correct endpoint and return the multisig account data", async () => {
      mockFetcher.mockResolvedValueOnce({
        content: {
          address,
          creator,
          signers: ["0x789"],
          threshold: 1,
        },
      } as ApiMultisigAccountData)
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
      )

      const response = await service.fetchMultisigAccountData({
        address,
        networkId: getMockNetwork().id,
      })
      expect(mockFetcher).toHaveBeenCalledWith(
        `http://example.com/sepolia/${address}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "argent-client": "argent-x",
            "argent-version": "Unknown version",
          },
          method: "GET",
          body: undefined,
        },
      )
      expect(response).toEqual({
        content: {
          address,
          creator,
          signers: ["0x789"],
          threshold: 1,
        },
      })

      expect(mockFetcher).toHaveBeenCalledTimes(1)
    })
    it("should throw on error", async () => {
      mockFetcher.mockRejectedValueOnce(new Error("some error"))
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
      )

      await expect(
        service.fetchMultisigAccountData({
          address,
          networkId: getMockNetwork().id,
        }),
      ).rejects.toThrowError("An error occured Error: some error")
    })
  })

  describe("fetchMultisigRequests", () => {
    it("should call the correct endpoint and return the multisig requests", async () => {
      const payload = {
        totalElements: 1,
        totalPages: 1,
        size: 1,
        content: [
          {
            id: "0x123",
            multisigAddress: address,
            creator,
            state: "AWAITING_SIGNATURES",
            transaction: {
              maxFee: "0",
              nonce: "0",
              version: "0",
              calls: [],
            },
            nonce: 0,
            nonApprovedSigners: [],
            approvedSigners: [],
          },
        ],
      } as ApiMultisigGetTransactionRequests
      mockFetcher.mockResolvedValueOnce(payload)
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
      )

      const response = await service.fetchMultisigTransactionRequests({
        address: address,
        networkId: getMockNetwork().id,
      })
      expect(mockFetcher).toHaveBeenCalledWith(
        `http://example.com/sepolia/${address}/request`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "argent-client": "argent-x",
            "argent-version": "Unknown version",
          },
          method: "GET",
          body: undefined,
        },
      )

      expect(response).toEqual(payload)

      expect(mockFetcher).toHaveBeenCalledTimes(1)
    })
    it("should throw on error", async () => {
      mockFetcher.mockRejectedValueOnce(new Error("some error"))
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
      )

      await expect(
        service.fetchMultisigTransactionRequests({
          address,
          networkId: getMockNetwork().id,
        }),
      ).rejects.toThrowError("An error occured Error: some error")
    })
  })

  describe("addNewTransaction", () => {
    it("should call the correct endpoint with the correct payload and return the correct hash", async () => {
      // Needs to be constant to get the same transaction hash
      const address =
        "0x0590374e464c0e1d8078ee2f1556d99e46d28e0f90788305f4e2b34df53950b8"

      const creator =
        "0x03ae16dac8ab10a29cb58a96051ba6b3b10d66afc327887105fd90c05486c24b"

      mockGetMultisigAccountFromBaseWallet.mockResolvedValueOnce({
        ...getMockAccount({
          address,
        }),
        threshold: 1,
        signers: ["0x123"],
        publicKey: "0x123",
        updatedAt: 123,
      })
      const payload = {
        creator,
        transaction: {
          maxFee: "0x1",
          nonce: "0x1",
          version: "0x1",
          calls: [
            {
              contractAddress: "randomContractAddress",
              calldata: ["randomCalldata"],
              entrypoint: "randomEntryPoint",
            },
          ],
        },
        starknetSignature: { r: "0xbc845e", s: "0x2b7d60e" },
      }
      const expectedRes = {
        content: {
          id: "0x123",
          multisigAddress: address,
          nonce: 1,
          approvedSigners: ["0x123"],
          nonApprovedSigners: [],
          state: "COMPLETE",
          creator,
          transaction: {
            maxFee: "0",
            nonce: "0",
            version: "0",
            calls: [],
          },
          starknetSignature: {
            r: "0",
            s: "0",
          },
        },
      }

      mockFetcher.mockResolvedValueOnce(expectedRes)
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
      )

      const returnValue = await service.createTransactionRequest({
        address: address,
        signature: [
          BigInt(creator).toString(),
          BigInt(12354654).toString(),
          BigInt(45602318).toString(),
        ],
        calls: [
          {
            entrypoint: "randomEntryPoint",
            calldata: ["randomCalldata"],
            contractAddress: "randomContractAddress",
          },
        ],
        transactionDetails: {
          walletAddress: "0x420",
          chainId: constants.StarknetChainId.SN_SEPOLIA,
          nonce: 1,
          cairoVersion: "1",
          maxFee: 1,
          version: "0x1",
        },
      })

      expect(mockFetcher).toHaveBeenCalledWith(
        `http://example.com/sepolia/${address}/request`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "argent-client": "argent-x",
            "argent-version": "Unknown version",
          },
          method: "POST",
          body: JSON.stringify(payload),
        },
      )

      expect(returnValue).toEqual({
        transaction_hash:
          "0x1d6b06bcd7e780fd0543979e46dfd091b292ebeda3e76e5f634ff1f56a8c998",
      })

      expect(mockFetcher).toHaveBeenCalledTimes(1)
    })
    it("should not execute the transaction directly is multisig threshold is more than 1", async () => {
      const address =
        "0x0590374e464c0e1d8078ee2f1556d99e46d28e0f90788305f4e2b34df53950b8"

      const creator =
        "0x03ae16dac8ab10a29cb58a96051ba6b3b10d66afc327887105fd90c05486c24b"

      mockGetMultisigAccountFromBaseWallet.mockResolvedValueOnce({
        ...getMockAccount({
          address,
        }),
        threshold: 2,
        signers: ["0x123"],
        publicKey: "0x123",
        updatedAt: 123,
      })
      const payload = {
        creator,
        transaction: {
          maxFee: "0x1",
          nonce: "0x1",
          version: "0x1",
          calls: [
            {
              contractAddress: "randomContractAddress",
              calldata: ["randomCalldata"],
              entrypoint: "randomEntryPoint",
            },
          ],
        },
        starknetSignature: { r: "0xbc845e", s: "0x2b7d60e" },
      }
      const expectedRes = {
        content: {
          id: "0x123",
          multisigAddress: address,
          nonce: 1,
          approvedSigners: ["0x123"],
          nonApprovedSigners: [],
          state: "COMPLETE",
          creator,
          transaction: {
            maxFee: "0",
            nonce: "0",
            version: "0",
            calls: [],
          },
          starknetSignature: {
            r: "0",
            s: "0",
          },
        },
      }

      mockFetcher.mockResolvedValueOnce(expectedRes)
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
        addToMultisigPendingTransactionsSpy,
      )

      const returnValue = await service.createTransactionRequest({
        address: address,
        signature: [
          BigInt(creator).toString(),
          BigInt(12354654).toString(),
          BigInt(45602318).toString(),
        ],
        calls: [
          {
            entrypoint: "randomEntryPoint",
            calldata: ["randomCalldata"],
            contractAddress: "randomContractAddress",
          },
        ],
        transactionDetails: {
          walletAddress: "0x420",
          chainId: constants.StarknetChainId.SN_SEPOLIA,
          nonce: 1,
          cairoVersion: "1",
          maxFee: 1,
          version: "0x1",
        },
      })
      expect(mockFetcher).toHaveBeenCalledWith(
        `http://example.com/sepolia/${address}/request`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "argent-client": "argent-x",
            "argent-version": "Unknown version",
          },
          method: "POST",
          body: JSON.stringify(payload),
        },
      )

      expect(returnValue).toEqual({
        transaction_hash:
          "0x1d6b06bcd7e780fd0543979e46dfd091b292ebeda3e76e5f634ff1f56a8c998",
      })

      expect(mockFetcher).toHaveBeenCalledTimes(1)

      expect(addToMultisigPendingTransactionsSpy).toHaveBeenCalledTimes(1)
      expect(addToMultisigPendingTransactionsSpy).toHaveBeenCalledWith({
        account: {
          address,
          networkId: "sepolia-alpha",
        },
        approvedSigners: ["0x123"],
        creator,
        id: "0x123",
        multisigAddress: address,
        nonApprovedSigners: [],
        nonce: 1,
        notify: false,
        requestId: "0x123",
        state: "COMPLETE",
        timestamp: Date.now(),
        transaction: {
          calls: [],
          maxFee: "0",
          nonce: "0",
          version: "0",
        },
        transactionHash:
          "0x1d6b06bcd7e780fd0543979e46dfd091b292ebeda3e76e5f634ff1f56a8c998",
        type: "INVOKE",
      })
    })
  })

  describe("addRequestSignature", () => {
    it("should call the correct endpoint with the correct payload and return the correct hash", async () => {
      const address = "0x1"

      mockGetMultisigAccountFromBaseWallet.mockResolvedValueOnce({
        ...getMockAccount({
          address,
        }),
        threshold: 2,
        signers: ["0x123"],
        publicKey: "0x123",
        updatedAt: 123,
      })

      const expectedRes = {
        content: {
          id: "0x123",
          multisigAddress: address,
          nonce: 1,
          approvedSigners: ["0x123"],
          nonApprovedSigners: [],
          state: "COMPLETE",
          creator,
          transaction: {
            maxFee: "0",
            nonce: "0",
            version: "0",
            calls: [],
          },
          starknetSignature: {
            r: "0",
            s: "0",
          },
        },
      } as ApiMultisigTransactionResponse

      mockFetcher.mockResolvedValueOnce(expectedRes)
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
        addToMultisigPendingTransactionsSpy,
      )
      const requestId = "0x6969"
      await service.addTransactionSignature({
        address: address,
        signature: [
          BigInt(45602318).toString(),
          BigInt(12354654).toString(),
          BigInt(45602318).toString(),
          BigInt(45602318).toString(),
        ],
        transactionToSign: {
          account: {
            address: "0x1",
            networkId: "sepolia-alpha",
          },
          approvedSigners: ["0x123"],
          creator,
          nonApprovedSigners: [],
          nonce: 1,
          notify: false,
          requestId,
          state: "COMPLETE",
          timestamp: Date.now(),
          transaction: {
            calls: [],
            maxFee: "0",
            nonce: "0",
            version: "0",
          },
          transactionHash:
            "0x2f66ff9611ad753dd0c69ff11f3d48dbf5d147aa0e42f6079012cd76bc794bc",
          type: "INVOKE",
        },
        chainId: constants.StarknetChainId.SN_SEPOLIA,
      })

      expect(mockFetcher).toHaveBeenCalledWith(
        `http://example.com/${chainIdToStarknetNetwork(
          constants.StarknetChainId.SN_SEPOLIA,
        )}/${address}/request/${requestId}/signature`,
        {
          body: '{"signer":"0x2b7d60e","starknetSignature":{"r":"0xbc845e","s":"0x2b7d60e"}}',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "argent-client": "argent-x",
            "argent-version": "Unknown version",
          },
          method: "POST",
        },
      )
      expect(addToMultisigPendingTransactionsSpy).toHaveBeenCalledTimes(1)
      expect(addToMultisigPendingTransactionsSpy).toHaveBeenCalledWith({
        account: {
          address: "0x1",
          networkId: "sepolia-alpha",
        },
        approvedSigners: ["0x123"],
        creator,
        nonApprovedSigners: [],
        nonce: 1,
        notify: false,
        requestId,
        state: "COMPLETE",
        timestamp: Date.now(),
        transaction: {
          calls: [],
          maxFee: "0",
          nonce: "0",
          version: "0",
        },
        transactionHash:
          "0x2f66ff9611ad753dd0c69ff11f3d48dbf5d147aa0e42f6079012cd76bc794bc",
        type: "INVOKE",
      })
    })
    it("should transform into a transaction if the threshold is met", async () => {
      const address = "0x1"

      mockGetMultisigAccountFromBaseWallet.mockResolvedValueOnce({
        ...getMockAccount({
          address,
        }),
        threshold: 1,
        signers: ["0x123"],
        publicKey: "0x123",
        updatedAt: 123,
      })

      const expectedRes = {
        content: {
          id: "0x123",
          multisigAddress: address,
          nonce: 1,
          approvedSigners: ["0x123"],
          nonApprovedSigners: [],
          state: "COMPLETE",
          creator,
          transaction: {
            maxFee: "0",
            nonce: "0",
            version: "0",
            calls: [],
          },
          starknetSignature: {
            r: "0",
            s: "0",
          },
        },
      } as ApiMultisigTransactionResponse

      mockFetcher.mockResolvedValueOnce(expectedRes)
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
        undefined,
        convertToTransactionSpy,
      )
      const requestId = "0x6969"
      await service.addTransactionSignature({
        address: address,
        signature: [
          BigInt(45602318).toString(),
          BigInt(12354654).toString(),
          BigInt(45602318).toString(),
          BigInt(45602318).toString(),
        ],
        transactionToSign: {
          account: {
            address: "0x1",
            networkId: "sepolia-alpha",
          },
          approvedSigners: ["0x123"],
          creator,
          nonApprovedSigners: [],
          nonce: 1,
          notify: false,
          requestId,
          state: "COMPLETE",
          timestamp: Date.now(),
          transaction: {
            calls: [],
            maxFee: "0",
            nonce: "0",
            version: "0",
          },
          transactionHash:
            "0x2f66ff9611ad753dd0c69ff11f3d48dbf5d147aa0e42f6079012cd76bc794bc",
          type: "INVOKE",
        },
        chainId: constants.StarknetChainId.SN_SEPOLIA,
      })

      expect(convertToTransactionSpy).toHaveBeenCalledTimes(1)
      expect(convertToTransactionSpy).toHaveBeenCalledWith("0x123", "COMPLETE")
    })
  })
})
