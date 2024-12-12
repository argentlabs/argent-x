import { describe, expect, vi } from "vitest"
import { FallbackRpcProvider } from "./FallbackRpcProvider"
import { delay } from "../utils/delay"

describe("FallbackRpcProvider", () => {
  const makeProvider = async (mockReset = true) => {
    const nodeUrls = [
      "https://foo.xyz/rpc/v5.0",
      "https://bar.xyz/rpc/v5.0",
      "https://baz.xyz/rpc/v5.0",
    ]
    const fetchImplementation = vi.fn()
    const backoffImplementation = vi.fn()
    fetchImplementation.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ result: "chain-foo" }),
    })
    const rpcProvider = new FallbackRpcProvider({
      nodeUrls,
      randomise: false,
      fetchImplementation,
      backoffImplementation,
    })
    /** wait fetch to chainId() in constructor to resolve */
    await delay(0)
    /** reset the mock by default */
    if (mockReset) {
      fetchImplementation.mockReset()
    }
    return {
      nodeUrls,
      fetchImplementation,
      backoffImplementation,
      rpcProvider,
    }
  }

  describe("when instantiated", () => {
    test("constructor calls starknet_chainId once only after nodeUrls are available", async () => {
      const { nodeUrls, fetchImplementation, rpcProvider } =
        await makeProvider(false)

      /** shouldn't call chainid method again */
      /* fetchImplementation.mockReset() */
      expect(await rpcProvider.getChainId()).toEqual("chain-foo")
      expect(fetchImplementation).toHaveBeenCalledWith(
        nodeUrls[0],
        expect.objectContaining({
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "starknet_chainId",
            id: 1,
          }),
        }),
      )
    })
  })

  describe("when using rpc methods", () => {
    describe("and the response is ok", () => {
      test("calls the first node and returns the expected value", async () => {
        const { nodeUrls, fetchImplementation, rpcProvider } =
          await makeProvider()
        fetchImplementation.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ result: { foo: "bar" } }),
        })
        const res = await rpcProvider.getTransactionReceipt("0x123")
        expect(fetchImplementation).toHaveBeenCalledWith(
          nodeUrls[0],
          expect.any(Object),
        )
        expect(res).toEqual({ foo: "bar" })
      })
    })
    describe("and the response is 429 or 500", () => {
      describe("but is eventually ok", () => {
        test("falls back to other nodes with backoff and returns the expected value", async () => {
          const {
            nodeUrls,
            fetchImplementation,
            backoffImplementation,
            rpcProvider,
          } = await makeProvider()
          fetchImplementation
            .mockResolvedValueOnce({
              ok: false,
              status: 429,
            })
            .mockResolvedValueOnce({
              ok: false,
              status: 500,
            })
            .mockResolvedValueOnce({
              ok: false,
              status: 429,
            })
            .mockResolvedValueOnce({
              ok: false,
              status: 200,
              json: async () => ({ result: { foo: "bar" } }),
            })
          const res = await rpcProvider.getTransactionReceipt("0x123")
          expect(fetchImplementation).toHaveBeenNthCalledWith(
            1,
            nodeUrls[0],
            expect.any(Object),
          )
          expect(fetchImplementation).toHaveBeenNthCalledWith(
            2,
            nodeUrls[1],
            expect.any(Object),
          )
          expect(fetchImplementation).toHaveBeenNthCalledWith(
            3,
            nodeUrls[2],
            expect.any(Object),
          )
          expect(fetchImplementation).toHaveBeenNthCalledWith(
            4,
            nodeUrls[0],
            expect.any(Object),
          )
          expect(backoffImplementation).toHaveBeenNthCalledWith(1, 1)
          expect(backoffImplementation).toHaveBeenNthCalledWith(2, 2)
          expect(backoffImplementation).toHaveBeenNthCalledWith(3, 3)
          expect(backoffImplementation).not.toHaveBeenNthCalledWith(4, 4)
          expect(res).toEqual({ foo: "bar" })
        })
      })
      describe("and exhausts retries", () => {
        test("falls back to other nodes with backoff and throws raw error", async () => {
          const {
            nodeUrls,
            fetchImplementation,
            backoffImplementation,
            rpcProvider,
          } = await makeProvider()
          fetchImplementation
            .mockResolvedValueOnce({
              ok: false,
              status: 429,
            })
            .mockResolvedValueOnce({
              ok: false,
              status: 500,
            })
            .mockResolvedValueOnce({
              ok: false,
              status: 429,
            })
            .mockResolvedValueOnce({
              ok: false,
              status: 500,
            })
            .mockResolvedValueOnce({
              ok: false,
              status: 429,
            })
          await expect(
            rpcProvider.getTransactionReceipt("0x123"),
          ).rejects.toThrow("rawResult.json is not a function")
          expect(fetchImplementation).toHaveBeenNthCalledWith(
            1,
            nodeUrls[0],
            expect.any(Object),
          )
          expect(fetchImplementation).toHaveBeenNthCalledWith(
            2,
            nodeUrls[1],
            expect.any(Object),
          )
          expect(fetchImplementation).toHaveBeenNthCalledWith(
            3,
            nodeUrls[2],
            expect.any(Object),
          )
          expect(fetchImplementation).toHaveBeenNthCalledWith(
            4,
            nodeUrls[0],
            expect.any(Object),
          )
          expect(fetchImplementation).toHaveBeenNthCalledWith(
            5,
            nodeUrls[1],
            expect.any(Object),
          )
          expect(backoffImplementation).toHaveBeenNthCalledWith(1, 1)
          expect(backoffImplementation).toHaveBeenNthCalledWith(2, 2)
          expect(backoffImplementation).toHaveBeenNthCalledWith(3, 3)
          expect(backoffImplementation).toHaveBeenNthCalledWith(4, 4)
          expect(backoffImplementation).not.toHaveBeenNthCalledWith(5, 5)
        })
      })
    })
  })
})
