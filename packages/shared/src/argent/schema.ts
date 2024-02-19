import { z } from "zod"

export const argentNetworkIdSchema = z.enum([
  "mainnet-alpha",
  "goerli-alpha",
  "sepolia-alpha",
])

export const argentBackendNetworkIdSchema = z.enum([
  "mainnet",
  "goerli",
  "sepolia",
])
