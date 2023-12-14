import {
  compiledContractClassSchema,
  cairoAssemblySchema,
} from "@argent/shared"
import type {
  DeclareContractPayload,
  UniversalDeployerContractPayload,
} from "starknet"
import { z } from "zod"

export type DeclareContract = {
  address?: string
  networkId?: string
} & DeclareContractPayload

export type DeployContract = {
  address: string
  networkId: string
} & UniversalDeployerContractPayload

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
