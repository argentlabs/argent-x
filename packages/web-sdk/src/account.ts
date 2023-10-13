import type { StarknetMethods } from "@argent/x-window"
import type { CreateTRPCProxyClient } from "@trpc/client"
import type { Signature } from "starknet"
import {
  Account,
  AccountInterface,
  ProviderInterface,
  SignerInterface,
  typedData,
} from "starknet"

import type { AppRouter } from "./trpc"

class UnimplementedSigner implements SignerInterface {
  async getPubKey(): Promise<string> {
    throw new Error("Method not implemented")
  }

  async signMessage(): Promise<Signature> {
    throw new Error("Method not implemented")
  }

  async signTransaction(): Promise<Signature> {
    throw new Error("Method not implemented")
  }

  async signDeclareTransaction(): Promise<Signature> {
    throw new Error("Method not implemented")
  }

  async signDeployAccountTransaction(): Promise<Signature> {
    throw new Error("Method not implemented")
  }
}

export class MessageAccount extends Account implements AccountInterface {
  public signer = new UnimplementedSigner()

  constructor(
    provider: ProviderInterface,
    public address: string,
    private readonly proxyLink: CreateTRPCProxyClient<AppRouter>,
  ) {
    super(provider, address, new UnimplementedSigner())
  }

  execute: StarknetMethods["execute"] = async (
    calls,
    abis,
    transactionsDetail,
  ) => {
    try {
      const txHash = await this.proxyLink.execute.mutate([
        calls,
        abis,
        transactionsDetail,
      ])
      return {
        transaction_hash: txHash,
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  signMessage: StarknetMethods["signMessage"] = async (
    typedData: typedData.TypedData,
  ): Promise<Signature> => {
    try {
      return await this.proxyLink.signMessage.mutate([typedData])
    } catch (error) {
      throw new Error(error)
    }
  }
}
