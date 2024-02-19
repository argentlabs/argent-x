import { BigNumberish, typedData } from "starknet"
import { z } from "zod"

interface GenericMessage {
  version: string
}
interface GenericV1Message extends GenericMessage {
  calldata: string[]
  chainId: string
  maxFee: BigNumberish
}
interface GenericV3Message extends GenericMessage {
  chain_id: string
  resource_bounds: {
    l1_gas: {
      max_amount: number
      max_price_per_unit: number
    }
    l2_gas: {
      max_amount: number
      max_price_per_unit: number
    }
  }
  tip: 0
  paymaster_data: []
  nonce_data_availability_mode: "L1"
  fee_data_availability_mode: "L1"
}

interface DeployV1Message {
  classHash: string
  salt: BigNumberish
}
interface DeployV3Message {
  class_hash: string
  constructor_calldata: string[]
  contract_address_salt: BigNumberish
}
interface StarknetDeployV1Message {
  message: GenericV1Message & DeployV1Message
  type: "starknetDeploy"
}
interface StarknetDeployV3Message {
  message: GenericV3Message & DeployV3Message
  type: "starknetDeployV3"
}
interface InvokeMessageV1 {
  contractAddress: string
  nonce: BigNumberish
}
interface InvokeMessageV3 {
  calldata: string[]
  sender_address: string
  nonce: BigNumberish
  account_deployment_data: []
}
interface StarknetInvokeV1Message {
  message: GenericV1Message & InvokeMessageV1
  type: "starknet"
}
interface StarknetInvokeV3Message {
  message: GenericV3Message & InvokeMessageV3
  type: "starknetV3"
}

export type CosignerMessage =
  | StarknetDeployV1Message
  | StarknetDeployV3Message
  | StarknetInvokeV1Message
  | StarknetInvokeV3Message

export interface CosignerOffchainMessage {
  chain: string
  accountAddress: string
  message: typedData.TypedData
}

export const CosignerResponseSchema = z.object({
  signature: z.object({
    r: z.string(),
    s: z.string(),
  }),
})

export type CosignerResponse = z.infer<typeof CosignerResponseSchema>

export type Cosigner = (
  message: CosignerMessage | CosignerOffchainMessage,
  isOffchainMessage?: boolean,
) => Promise<CosignerResponse>
