import { EventEmitter } from "events"

import type { JsonRpcProvider } from "@walletconnect/jsonrpc-provider"
import type SignClient from "@walletconnect/sign-client"
import {
  SIGNER_EVENTS,
  SignerConnection,
} from "@walletconnect/signer-connection"
import type { SignerConnectionClientOpts } from "@walletconnect/signer-connection"
import type { ProposalTypes, SessionTypes } from "@walletconnect/types"
import {
  getAccountsFromNamespaces,
  getChainsFromNamespaces,
} from "@walletconnect/utils"

import type { EthereumRpcConfig } from "./starknet/starknetAdapter"

export interface NamespaceAdapterOptions {
  client: SignClient
  chainId?: string | number
  rpcUrl?: string
}

export abstract class NamespaceAdapter {
  abstract namespace: string
  abstract chainId: number | string
  abstract methods: string[]
  abstract events: string[]
  abstract session?: SessionTypes.Struct
  abstract signerConnection: SignerConnection
  abstract rpc: EthereumRpcConfig
  protected abstract rpcProvider: JsonRpcProvider

  protected abstract parseChainId(chainId: string): number | string
  protected abstract formatChainId(chainId: string | number): string
  protected abstract setAccounts(accounts: string[]): void

  protected accounts: string[] = []
  protected eventEmitter = new EventEmitter()

  updateSession = (session: SessionTypes.Struct) => {
    if (!this.isValidSession(session)) {
      console.warn(
        "updateSession incompatible session",
        session,
        "for adapter",
        this.formatChainId(this.chainId),
      )
      throw new Error("Invalid session")
    }
    this.session = session
    const chains = getChainsFromNamespaces(session.namespaces, [this.namespace])
    this.setChainIds(chains)
    const accounts = getAccountsFromNamespaces(session.namespaces, [
      this.namespace,
    ])
    this.setAccounts(accounts)
  }

  isValidSession = ({
    namespaces,
    requiredNamespaces,
  }: SessionTypes.Struct) => {
    const chain = this.formatChainId(this.chainId)
    if (requiredNamespaces) {
      return !!requiredNamespaces[this.namespace]?.chains.includes(chain)
    }
    return !!namespaces?.[this.namespace]?.accounts.some((account) =>
      account.startsWith(chain),
    )
  }

  getRequiredNamespaces(): ProposalTypes.RequiredNamespaces {
    const chains = [this.formatChainId(this.chainId)]
    return {
      [this.namespace]: { chains, methods: this.methods, events: this.events },
    }
  }

  protected isCompatibleChainId(chainId: string): boolean {
    return typeof chainId === "string"
      ? chainId.startsWith(`${this.namespace}:`)
      : false
  }

  protected setChainIds(chains: string[]) {
    const compatible = chains.filter((x) => this.isCompatibleChainId(x))
    const chainIds = compatible
      .map((c) => this.parseChainId(c))
      .filter((c) => c !== this.chainId)
    if (chainIds.length) {
      this.chainId = chainIds[0]
      this.eventEmitter.emit("chainChanged", this.chainId)
    }
  }

  protected setChainId(chain: string) {
    if (this.isCompatibleChainId(chain)) {
      const chainId = this.parseChainId(chain)
      this.chainId = chainId
      this.eventEmitter.emit("chainChanged", this.chainId)
    }
  }

  protected parseAccountId(account: string): {
    chainId: string
    address: string
  } {
    const [namespace, reference, address] = account.split(":")
    const chainId = `${namespace}:${reference}`
    return { chainId, address }
  }

  protected getSignerConnection(client?: SignerConnectionClientOpts) {
    return new SignerConnection({
      requiredNamespaces: {
        [this.namespace]: {
          chains: this.rpc.chains,
          methods: this.rpc.methods,
          events: this.rpc.events,
        },
      },
      client,
    })
  }

  protected registerEventListeners() {
    this.rpcProvider.on("connect", () => {
      const { chains, accounts } = this.signerConnection
      if (chains?.length) {
        this.setChainIds(chains)
      }
      if (accounts?.length) {
        this.setAccounts(accounts)
      }
    })
    this.signerConnection.on(SIGNER_EVENTS.created, this.updateSession)
    this.signerConnection.on(SIGNER_EVENTS.updated, this.updateSession)
    this.signerConnection.on(SIGNER_EVENTS.event, (params: any) => {
      if (!this.rpc.chains.includes(params.chainId)) {
        return
      }
      const { event } = params
      if (event.name === "accountsChanged") {
        this.accounts = event.data
        this.eventEmitter.emit("accountsChanged", this.accounts)
      } else if (event.name === "chainChanged") {
        this.setChainId(event.data)
      } else {
        this.eventEmitter.emit(event.name, event.data)
      }
    })
    this.rpcProvider.on("disconnect", () => {
      this.eventEmitter.emit("disconnect")
    })
  }
}
