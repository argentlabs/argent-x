import { constants } from "starknet"
import { MockedFunction } from "vitest"
import { getMockNetwork } from "../../../../../test/network.mock"
import {
  ApiMultisigAccountData,
  ApiMultisigDataForSigner,
  ApiMultisigGetRequests,
  ApiMultisigTxnResponse,
} from "../../multisig.model"
import { MultisigBackendService } from "./implementation"
import { getMultisigAccountFromBaseWallet } from "../../utils/baseMultisig"
import { getMockAccount } from "../../../../../test/account.mock"
import { chainIdToStarknetNetwork } from "../../../utils/starknetNetwork"

vi.mock("../../utils/baseMultisig")
vi.mock("../../pendingTransactionsStore")
const addToMultisigPendingTransactionsSpy = vi.fn()
const cancelMultisigPendingTransactionsSpy = vi.fn()
const convertToTransactionSpy = vi.fn()

const mockGetMultisigAccountFromBaseWallet =
  getMultisigAccountFromBaseWallet as MockedFunction<
    typeof getMultisigAccountFromBaseWallet
  >

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
            address: "0x123",
            creator: "0x456",
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
        `http://example.com/testnet?signer=${signerName}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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
            address: "0x123",
            creator: "0x456",
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
          address: "0x123",
          creator: "0x456",
          signers: ["0x789"],
          threshold: 1,
        },
      } as ApiMultisigAccountData)
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
      )
      const address = "0x1"

      const response = await service.fetchMultisigAccountData({
        address: address,
        networkId: getMockNetwork().id,
      })
      expect(mockFetcher).toHaveBeenCalledWith(
        `http://example.com/testnet/${address}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "GET",
          body: undefined,
        },
      )
      expect(response).toEqual({
        content: {
          address: "0x123",
          creator: "0x456",
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
      const address = "0x1"

      await expect(
        service.fetchMultisigAccountData({
          address: address,
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
            multisigAddress: "0x456",
            creator: "0x789",
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
      } as ApiMultisigGetRequests
      mockFetcher.mockResolvedValueOnce(payload)
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
      )
      const address = "0x1"

      const response = await service.fetchMultisigRequests({
        address: address,
        networkId: getMockNetwork().id,
      })
      expect(mockFetcher).toHaveBeenCalledWith(
        `http://example.com/testnet/${address}/request`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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
      const address = "0x1"

      await expect(
        service.fetchMultisigRequests({
          address: address,
          networkId: getMockNetwork().id,
        }),
      ).rejects.toThrowError("An error occured Error: some error")
    })
  })

  describe("addNewTransaction", () => {
    it("should call the correct endpoint with the correct payload and return the correct hash", async () => {
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
      const payload = {
        creator: "0x2b7d60e",
        transaction: {
          maxFee: "0x1",
          nonce: "0x1",
          version: "0x1",
          calls: [
            {
              contractAddress: "randomContractAddress",
              entrypoint: "randomEntryPoint",
              calldata: ["randomCalldata"],
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
          creator: "0x123",
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
      } as ApiMultisigTxnResponse

      mockFetcher.mockResolvedValueOnce(expectedRes)
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
      )

      const returnValue = await service.addNewTransaction({
        address: address,
        signature: [
          BigInt(45602318).toString(),
          BigInt(12354654).toString(),
          BigInt(45602318).toString(),
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
          chainId: constants.StarknetChainId.SN_GOERLI,
          nonce: 1,
          cairoVersion: "1",
          maxFee: 1,
          version: 1,
        },
      })
      expect(mockFetcher).toHaveBeenCalledWith(
        `http://example.com/testnet/${address}/request`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(payload),
        },
      )

      expect(returnValue).toEqual({
        transaction_hash:
          "0x2f66ff9611ad753dd0c69ff11f3d48dbf5d147aa0e42f6079012cd76bc794bc",
      })

      expect(mockFetcher).toHaveBeenCalledTimes(1)
    })
    it("should not execute the transaction directly is multisig threshold is more than 1", async () => {
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
      const payload = {
        creator: "0x2b7d60e",
        transaction: {
          maxFee: "0x1",
          nonce: "0x1",
          version: "0x1",
          calls: [
            {
              contractAddress: "randomContractAddress",
              entrypoint: "randomEntryPoint",
              calldata: ["randomCalldata"],
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
          creator: "0x123",
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
      } as ApiMultisigTxnResponse

      mockFetcher.mockResolvedValueOnce(expectedRes)
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
        addToMultisigPendingTransactionsSpy,
      )

      const returnValue = await service.addNewTransaction({
        address: address,
        signature: [
          BigInt(45602318).toString(),
          BigInt(12354654).toString(),
          BigInt(45602318).toString(),
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
          chainId: constants.StarknetChainId.SN_GOERLI,
          nonce: 1,
          cairoVersion: "1",
          maxFee: 1,
          version: 1,
        },
      })
      expect(mockFetcher).toHaveBeenCalledWith(
        `http://example.com/testnet/${address}/request`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(payload),
        },
      )

      expect(returnValue).toEqual({
        transaction_hash:
          "0x2f66ff9611ad753dd0c69ff11f3d48dbf5d147aa0e42f6079012cd76bc794bc",
      })

      expect(mockFetcher).toHaveBeenCalledTimes(1)

      expect(addToMultisigPendingTransactionsSpy).toHaveBeenCalledTimes(1)
      expect(addToMultisigPendingTransactionsSpy).toHaveBeenCalledWith({
        account: {
          address: "0x1",
          networkId: "goerli-alpha",
        },
        approvedSigners: ["0x123"],
        creator: "0x123",
        id: "0x123",
        multisigAddress: "0x1",
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
          "0x2f66ff9611ad753dd0c69ff11f3d48dbf5d147aa0e42f6079012cd76bc794bc",
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
          creator: "0x123",
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
      } as ApiMultisigTxnResponse

      mockFetcher.mockResolvedValueOnce(expectedRes)
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
        addToMultisigPendingTransactionsSpy,
      )
      const requestId = "0x6969"
      await service.addRequestSignature({
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
            networkId: "goerli-alpha",
          },
          approvedSigners: ["0x123"],
          creator: "0x123",
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
        chainId: constants.StarknetChainId.SN_GOERLI,
      })

      expect(mockFetcher).toHaveBeenCalledWith(
        `http://example.com/${chainIdToStarknetNetwork(
          constants.StarknetChainId.SN_GOERLI,
        )}/${address}/request/${requestId}/signature`,
        {
          body: '{"signer":"0x2b7d60e","starknetSignature":{"r":"0xbc845e","s":"0x2b7d60e"}}',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      )
      expect(addToMultisigPendingTransactionsSpy).toHaveBeenCalledTimes(1)
      expect(addToMultisigPendingTransactionsSpy).toHaveBeenCalledWith({
        account: {
          address: "0x1",
          networkId: "goerli-alpha",
        },
        approvedSigners: ["0x123"],
        creator: "0x123",
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
    it("should cancel the pending transaction an transform into a transaction if the threshold is met", async () => {
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
          creator: "0x123",
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
      } as ApiMultisigTxnResponse

      mockFetcher.mockResolvedValueOnce(expectedRes)
      const service = new MultisigBackendService(
        "http://example.com",
        mockFetcher,
        undefined,
        cancelMultisigPendingTransactionsSpy,
        convertToTransactionSpy,
      )
      const requestId = "0x6969"
      await service.addRequestSignature({
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
            networkId: "goerli-alpha",
          },
          approvedSigners: ["0x123"],
          creator: "0x123",
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
        chainId: constants.StarknetChainId.SN_GOERLI,
      })

      expect(cancelMultisigPendingTransactionsSpy).toHaveBeenCalledTimes(1)
      expect(cancelMultisigPendingTransactionsSpy).toHaveBeenCalledWith({
        address: "0x1",
        networkId: "goerli-alpha",
      })
      expect(convertToTransactionSpy).toHaveBeenCalledTimes(1)
      expect(convertToTransactionSpy).toHaveBeenCalledWith("0x123", "COMPLETE")
    })
  })
})
