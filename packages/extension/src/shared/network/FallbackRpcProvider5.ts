import type { RpcProviderOptions, constants } from "starknet5"
import { RpcProvider, json as starknetJson } from "starknet5"
import { delay } from "../utils/delay"
import { exponentialBackoff } from "./exponentialBackoff"
import { shuffle } from "lodash-es"

export type RequestBody = {
  id?: number | string
  jsonrpc: "2.0"
  method: string
  params?: object
}

export type FallbackRpcProviderOptions = Omit<RpcProviderOptions, "nodeUrl"> & {
  /** array of node URLs, will be randomised by default */
  nodeUrls: string[]
  /** whether to randomise the URLs, default true */
  randomise?: boolean
  maxRetryCount?: number
  fetchImplementation?: typeof fetch
  backoffImplementation?: (retryCount: number) => number
}

export class FallbackRpcProvider5 extends RpcProvider {
  public nodeUrls: string[]
  private nodeIndex
  private maxRetryCount
  private fetchImplementation
  private backoffImplementation

  constructor(optionsOrProvider: FallbackRpcProviderOptions) {
    const {
      nodeUrls,
      randomise = true,
      maxRetryCount = 5,
      fetchImplementation,
      backoffImplementation = exponentialBackoff,
      ...rest
    } = optionsOrProvider
    if (!nodeUrls.length) {
      throw new Error("nodeUrls must contain at least one element")
    }
    super({
      ...rest,
      nodeUrl: nodeUrls[0],
    })
    this.nodeUrls = randomise ? shuffle(nodeUrls) : nodeUrls
    this.nodeIndex = randomise ? Math.floor(Math.random() * nodeUrls.length) : 0
    this.maxRetryCount = maxRetryCount
    this.fetchImplementation = fetchImplementation
    this.backoffImplementation = backoffImplementation
    void this.getChainId()
  }

  /**
   * TODO: follow-up - update starknet.js that removes the following behaviour
   *
   * super calls async getChainId() in constructor before `this` or `this.nodeUrls` etc. are initialised
   * as a workaround we return undefined here so that chainId doesn't get set
   * then we call it again at the end of the constructor once `this` and `this.nodeUrls` are initialised
   */
  public async getChainId(): Promise<constants.StarknetChainId> {
    if (!this.nodeUrls) {
      // return undefined so the result doesn't get set
      return undefined as unknown as constants.StarknetChainId
    }
    return super.getChainId()
  }

  /** TODO: follow-up - update starknet.js that also takes an id here */
  public fetch(method: string, params?: object) {
    const rpcRequestBody: RequestBody = {
      jsonrpc: "2.0",
      method,
      ...(params && { params }),
      id: 0,
    }
    return this.fetchWithRetry({
      method: "POST",
      body: starknetJson.stringify(rpcRequestBody),
      headers: this.headers as Record<string, string>,
    })
  }

  public async fetchWithRetry(
    init: RequestInit,
    retryCount = 0,
  ): Promise<Response> {
    const nodeUrl = this.nodeUrls ? this.nodeUrls[this.nodeIndex] : this.nodeUrl
    try {
      // Can't keep a reference to fetch - causes 'Illegal invocation' error in background
      const fetchImplementation = this.fetchImplementation ?? fetch
      const nodeIndexUsed = this.nodeIndex
      const response = await fetchImplementation(nodeUrl, init)
      if (!response.ok) {
        if (nodeIndexUsed === this.nodeIndex) {
          // Switch to next node immediately
          this.nodeIndex = (this.nodeIndex + 1) % this.nodeUrls.length
        }
        // We only want to retry on 429 and 5xx http errors
        if (response.status < 500 && response.status !== 429) {
          return response
        }
        // Try again up to maxRetryCount
        retryCount++
        if (retryCount < this.maxRetryCount) {
          await delay(this.backoffImplementation(retryCount))
          return this.fetchWithRetry(init, retryCount)
        }
      }
      return response
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
