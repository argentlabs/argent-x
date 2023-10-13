import { JsonRpcProvider } from "@walletconnect/jsonrpc-provider"
import type SignClient from "@walletconnect/sign-client"
import type { SignerConnection } from "@walletconnect/signer-connection"
import type { SessionTypes } from "@walletconnect/types"
import type {
  ConnectedStarknetWindowObject,
  RpcMessage,
} from "get-starknet-core"
import { Provider } from "starknet"
import type {
  AccountInterface,
  ProviderInterface,
  SignerInterface,
} from "starknet"
import { constants } from "starknet"

import { NamespaceAdapter } from "../adapter"
import type { NamespaceAdapterOptions } from "../adapter"
import type { IStarknetRpc } from "./starknet.model"
import { StarknetRemoteAccount } from "./starknetAccount"
import { StarknetRemoteSigner } from "./starknetSigner"

export interface EthereumRpcConfig {
  chains: string[]
  methods: string[]
  events: string[]
}

export const serializeStarknetChainId = (chainId: string): string =>
  chainId.replace(/^SN_/, "SN")

export const deserializeStarknetChainId = (chainId: string): string =>
  chainId.replace(/^SN/, "SN_")

export class StarknetAdapter
  extends NamespaceAdapter
  implements ConnectedStarknetWindowObject
{
  // StarknetWindowObject
  id = "liftoff"
  name = "Argent Liftoff"
  version = "0.1.0"
  icon = ""
  provider: ProviderInterface
  signer: undefined
  account: AccountInterface
  selectedAddress = ""

  // NamespaceAdapter
  public namespace = "starknet"
  public methods = [
    "starknet_signTypedData",
    "starknet_requestAddInvokeTransaction",
  ]
  public events = ["chainChanged", "accountsChanged"]

  public remoteSigner: SignerInterface
  public signerConnection: SignerConnection
  public rpcProvider: JsonRpcProvider
  public chainId: string
  public client: SignClient
  public session?: SessionTypes.Struct
  public rpc: EthereumRpcConfig

  private walletRpc: IStarknetRpc

  constructor({ client, chainId, rpcUrl }: NamespaceAdapterOptions) {
    super()

    this.chainId = String(chainId || "SN_GOERLI")
    this.rpc = {
      chains: chainId ? [this.formatChainId(this.chainId)] : [],
      methods: this.methods,
      events: this.events,
    }
    this.signerConnection = this.getSignerConnection(client)
    this.rpcProvider = new JsonRpcProvider(this.signerConnection)
    this.client = client
    this.registerEventListeners()

    this.walletRpc = new Proxy({} as IStarknetRpc, {
      get: (_, method: string) => (params: unknown) =>
        this.requestWallet({ method, params }),
    })

    this.remoteSigner = new StarknetRemoteSigner(this.walletRpc)

    if (rpcUrl) {
      this.provider = new Provider({ rpc: { nodeUrl: rpcUrl } })
    } else {
      const network = this.getNetworkName(this.chainId)
      this.provider = new Provider({ sequencer: { network } })
    }
    this.account = new StarknetRemoteAccount(
      this.provider,
      "",
      this.remoteSigner,
      this.walletRpc,
    )
  }

  getNetworkName(chainId: string): constants.NetworkName {
    if (chainId === "SN_GOERLI") {
      return constants.NetworkName.SN_GOERLI
    }
    if (chainId === "SN_GOERLI2") {
      return constants.NetworkName.SN_GOERLI
    }
    if (chainId === "SN_MAIN") {
      return constants.NetworkName.SN_GOERLI
    }
    throw new Error(`Unknown starknet.js network name for chainId ${chainId}`)
  }

  // StarknetWindowObject

  async request<T extends RpcMessage>(
    _call: Omit<T, "result">,
  ): Promise<T["result"]> {
    // request() is mostly used  for messages like `wallet_watchAsset` etc.
    // regular transactions calls are done through .account.execute
    throw new Error("Not implemented: .request()")
  }

  async enable(): Promise<string[]> {
    await this.rpcProvider.connect()
    return this.accounts
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  get isConnected(): boolean {
    return this.signerConnection.connected
  }

  async isPreauthorized(): Promise<boolean> {
    throw new Error("Not implemented: .isPreauthorized()")
  }

  on: ConnectedStarknetWindowObject["on"] = (event, handleEvent) => {
    this.eventEmitter.on(event, handleEvent)
  }

  off: ConnectedStarknetWindowObject["off"] = (event, handleEvent) => {
    this.eventEmitter.off(event, handleEvent)
  }

  private async requestWallet(request: { method: string; params: any }) {
    if (!this.session) {
      throw new Error("No session")
    }
    try {
      const { topic } = this.session
      const chainId = this.formatChainId(this.chainId)
      const response = await this.client.request({ topic, chainId, request })
      return response
    } catch (error) {
      throw new Error(error)
    }
  }

  // NamespaceAdapter

  get isConnecting(): boolean {
    return this.signerConnection.connecting
  }

  public async disable(): Promise<void> {
    await this.rpcProvider.disconnect()
  }

  get isWalletConnect() {
    return true
  }

  // NamespaceAdapter private methods

  protected registerEventListeners() {
    super.registerEventListeners()
    this.eventEmitter.on("chainChanged", (_chainId: string) => {
      throw new Error("Not implemented: chainChanged")
      // TODO: update provider
    })
  }

  protected formatChainId(chainId: string): string {
    return `${this.namespace}:${serializeStarknetChainId(chainId)}`
  }

  protected parseChainId(chainId: string): string {
    return deserializeStarknetChainId(chainId.split(":")[1])
  }

  protected setAccounts(accounts: string[]) {
    this.accounts = accounts
      .filter(
        (x) =>
          this.parseChainId(this.parseAccountId(x).chainId) === this.chainId,
      )
      .map((x) => this.parseAccountId(x).address)

    const { address } = this.parseAccountId(accounts[0])
    const fixedAddress = !address.startsWith("0x") ? `0x${address}` : address
    this.account = new StarknetRemoteAccount(
      this.provider,
      fixedAddress,
      this.remoteSigner,
      this.walletRpc,
    )
    this.eventEmitter.emit("accountsChanged", this.accounts)
  }
}
