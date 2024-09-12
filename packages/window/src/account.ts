import {
  Account,
  AccountInterface,
  ProviderInterface,
  Signature,
  SignerInterface,
} from "starknet"

import { Sender } from "./messages/exchange/bidirectional"
import { StarknetMethods } from "./types"
import { TypedData } from "@starknet-io/types-js"

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
    private readonly remoteHandle: Sender<StarknetMethods>,
  ) {
    super(provider, address, new UnimplementedSigner())
  }

  async execute(
    calls: Parameters<StarknetMethods["execute"]>[0],
    abiOrDetails?: Parameters<StarknetMethods["execute"]>[1] | any[],
    transactionDetails: Parameters<StarknetMethods["execute"]>[1] = {},
  ): ReturnType<StarknetMethods["execute"]> {
    return this.remoteHandle.call(
      "execute",
      calls,
      Array.isArray(abiOrDetails) ? transactionDetails : abiOrDetails,
    )
  }

  async signMessage(
    typedData: TypedData & { message: Record<string, unknown> },
  ): Promise<Signature> {
    return this.remoteHandle.call("signMessage", typedData)
  }
}
