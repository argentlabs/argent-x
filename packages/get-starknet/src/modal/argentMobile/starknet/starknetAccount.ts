import type {
  Abi,
  AccountInterface,
  Call,
  DeclareContractPayload,
  DeclareContractResponse,
  DeployContractResponse,
  InvocationsDetails,
  InvokeFunctionResponse,
  ProviderInterface,
  SignerInterface,
} from "starknet"
import { Account } from "starknet"

import type { IStarknetRpc } from "./starknet.model"

export class StarknetRemoteAccount extends Account implements AccountInterface {
  constructor(
    provider: ProviderInterface,
    address: string,
    signer: SignerInterface,
    private wallet: IStarknetRpc,
  ) {
    super(provider, address, signer)
  }

  public async execute(
    calls: Call | Call[],
    abis: Abi[] | undefined = undefined,
    invocationDetails: InvocationsDetails = {},
  ): Promise<InvokeFunctionResponse> {
    calls = Array.isArray(calls) ? calls : [calls]
    return await this.wallet.starknet_requestAddInvokeTransaction({
      accountAddress: this.address,
      executionRequest: { calls, abis, invocationDetails },
    })
  }

  public async declare(
    _contractPayload: DeclareContractPayload,
    _transactionsDetail?: InvocationsDetails | undefined,
  ): Promise<DeclareContractResponse> {
    throw new Error("Not supported via Argent Login")
  }

  public async deployAccount(
    _contractPayload: any,
    _transactionsDetail?: InvocationsDetails | undefined,
  ): Promise<DeployContractResponse> {
    throw new Error("Not supported via Argent Login")
  }
}
