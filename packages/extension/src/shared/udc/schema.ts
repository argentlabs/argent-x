import {
  Address,
  cairoAssemblySchema,
  compiledContractClassSchema,
} from "@argent/shared"
import {
  CairoVersion,
  DeclareContractPayload,
  UniversalDeployerContractPayload,
} from "starknet"
import { z } from "zod"
import { BaseWalletAccount } from "../wallet.model"

export const getConstructorParamsSchema = z.object({
  networkId: z.string(),
  classHash: z.string(),
})

export const basicContractClassSchema = z.object({
  abi: z.array(z.any()),
  contract_class_version: z.string(),
  entry_points_by_type: z.any().optional(),
  sierra_program: z.array(z.string()).optional(),
})

export type BasicContractClass = z.infer<typeof basicContractClassSchema>

export interface DeclareContract {
  payload: DeclareContractPayload
  feeTokenAddress: Address
  account?: BaseWalletAccount
}

export interface DeployContract {
  payload: UniversalDeployerContractPayload
  feeTokenAddress: Address
  account?: BaseWalletAccount
}

export const declareContractSchema = z.object({
  address: z.string().optional(),
  networkId: z.string().optional(),
  contract: compiledContractClassSchema.or(z.string()),
  classHash: z.string().optional(),
  casm: cairoAssemblySchema.optional(),
  compiledClassHash: z.string().optional(),
})

export type DeclareContractBackgroundPayload = z.infer<
  typeof declareContractSchema
>

export const deployContractSchema = z.object({
  address: z.string(),
  networkId: z.string(),
  classHash: z.string(),
  constructorCalldata: z.array(z.string()),
  salt: z.string().optional(),
  unique: z.boolean().optional(),
})

export type ParameterField =
  | {
      name: string
      type: `felt` | `Uint256`
      value: string
    }
  | {
      name: string
      type: `felt*`
      value: string[]
    }

export interface FieldValues {
  account: string
  classHash: string
  network: string
  parameters: ParameterField[]
  salt: string
  unique: boolean
  cairoVersion: CairoVersion
}
