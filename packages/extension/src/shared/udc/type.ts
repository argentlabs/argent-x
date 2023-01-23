import type {
  DeclareContractPayload,
  UniversalDeployerContractPayload,
} from "starknet"

export type DeclareContract =
  | ({
      address: string
      networkId: string
    } & DeclareContractPayload)
  | DeclareContractPayload

export type DeployContract = {
  address: string
  networkId: string
} & UniversalDeployerContractPayload
