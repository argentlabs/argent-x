import type { DeclareContractPayload } from "starknet"

export type DeclareContract = {
  address: string
  networkId: string
} & DeclareContractPayload
