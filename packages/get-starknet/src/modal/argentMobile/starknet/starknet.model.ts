import type {
  Abi,
  Call,
  InvocationsDetails,
  InvokeFunctionResponse,
  Signature,
  typedData,
} from "starknet"

// see https://github.com/WalletConnect/walletconnect-docs/pull/288/files
export interface IStarknetRpc {
  starknet_signTypedData(params: {
    accountAddress: string
    typedData: typedData.TypedData
  }): Promise<{ signature: Signature }>
  starknet_requestAddInvokeTransaction(params: {
    accountAddress: string
    executionRequest: {
      calls: Call[]
      abis?: Abi[]
      invocationDetails?: InvocationsDetails
    }
  }): Promise<InvokeFunctionResponse>
}
