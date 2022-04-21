import { SchemaOf, object, string } from "yup"

import { Network } from "./networks"

export interface CustomNetwork extends Network {
  baseUrl: string
  rpcUrl?: string
}

const REGEX_HEXSTRING = /^0x[a-f0-9]+$/i

export const CustomNetworkSchema: SchemaOf<CustomNetwork> = object()
  .required()
  .shape({
    id: string().required().min(2).max(31),
    name: string().required().min(2).max(128),
    chainId: string()
      .required()
      .min(2)
      .max(31) // max 31 characters as required by starknet short strings
      .matches(/^[A-Z0-9_]+$/, {
        message:
          "${path} must be uppercase alphanumeric or underscore, like 'SN_GOERLI'",
      }),
    baseUrl: string().required().url(),
    accountImplementation: string().optional().matches(REGEX_HEXSTRING),
    explorerUrl: string().optional().url(),
    rpcUrl: string().optional().url(),
  })
