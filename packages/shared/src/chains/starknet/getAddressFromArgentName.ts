import urlJoin from "url-join"
import { z } from "zod"
import {
  HttpError,
  IHttpService,
  addressSchemaArgentBackend,
  isValidAddress,
  isZeroAddress,
  normalizeAddress,
} from "../.."
import { AddressError } from "../../errors/address"
import { ArgentName, argentNameSchema } from "./argentName"

export const apiWalletResponseSchema = z
  .object({
    walletAddress: addressSchemaArgentBackend,
    ens: argentNameSchema,
    chain: z.enum(["ethereum", "starknet"]),
    deleted: z.boolean(),
    walletDeployed: z.boolean(),
  })
  .or(
    z.object({
      status: z.string(),
    }),
  )

export type ApiWalletResponse = z.infer<typeof apiWalletResponseSchema>

export type MinimalHttpService = Pick<IHttpService, "get">

export async function getAddressFromArgentName(
  argentName: ArgentName,
  httpService: MinimalHttpService,
  baseUrl: string,
  chain: "ethereum" | "starknet" = "starknet",
) {
  const query = {
    ens: argentName,
    chain,
  }
  const searchParams = new URLSearchParams(query)
  const url = urlJoin(baseUrl, "wallet", `?${searchParams}`)
  try {
    const response = await httpService.get<ApiWalletResponse>(url)

    const argentNameAddress =
      response && "walletAddress" in response
        ? response.walletAddress
        : undefined

    if (!argentNameAddress) {
      throw new AddressError({
        code: "NO_ADDRESS_FROM_ARGENT_NAME",
      })
    }

    if (isZeroAddress(argentNameAddress)) {
      throw new AddressError({
        code: "ARGENT_NAME_NOT_FOUND",
        message: `${argentName} not found`,
      })
    }

    const isValid = isValidAddress(argentNameAddress)
    if (!isValid) {
      /** service returned but not a valid address */
      throw new AddressError({
        code: "ARGENT_NAME_INVALID_ADDRESS",
        message: `${argentName} resolved to an invalid address (${argentNameAddress})`,
      })
    }

    return normalizeAddress(argentNameAddress)
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      throw new AddressError({
        code: "ARGENT_NAME_NOT_FOUND",
        message: `${argentName} not found`,
      })
    } else {
      throw e
    }
  }
}
