import type {
  Abi,
  DeclareSignerDetails,
  DeployAccountSignerDetails,
  Invocation,
  InvocationsSignerDetails,
  Signature,
  SignerInterface,
  typedData,
} from "starknet"

import type { IStarknetRpc } from "./starknet.model"

export class StarknetRemoteSigner implements SignerInterface {
  constructor(private wallet: IStarknetRpc) {}

  public async getPubKey(): Promise<string> {
    throw new Error("Not supported via Argent Login")
  }

  public async signMessage(
    typedData: typedData.TypedData,
    accountAddress: string,
  ): Promise<Signature> {
    const { signature } = await this.wallet.starknet_signTypedData({
      accountAddress,
      typedData,
    })
    return signature
  }

  public async signTransaction(
    _transactions: Invocation[],
    _transactionsDetail: InvocationsSignerDetails,
    _abis?: Abi[],
  ): Promise<Signature> {
    throw new Error("Not supported via Argent Login")
  }

  public async signDeployAccountTransaction(
    _transaction: DeployAccountSignerDetails,
  ): Promise<Signature> {
    throw new Error("Not supported via Argent Login")
  }

  public async signDeclareTransaction(
    _transaction: DeclareSignerDetails,
  ): Promise<Signature> {
    throw new Error("Not supported via Argent Login")
  }
}
