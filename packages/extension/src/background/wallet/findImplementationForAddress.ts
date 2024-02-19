import { hexSchema, isEqualAddress } from "@argent/shared"
import { WalletAccount, cairoVersionSchema } from "../../shared/wallet.model"
import { z } from "zod"
import {
  ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES,
  C0_PROXY_CONTRACT_CLASS_HASHES,
} from "../../shared/account/starknet.constants"
import { uniqWith } from "lodash-es"
import { CallData, Calldata, hash } from "starknet"
import { AccountError } from "../../shared/errors/account"
import { STANDARD_DEVNET_ACCOUNT_CLASS_HASH } from "../../shared/network/constants"

export const implementationSchema = z.object({
  cairoVersion: cairoVersionSchema,
  accountClassHash: hexSchema,
})
export type Implementation = z.infer<typeof implementationSchema>
export const isEqualImplementation = (a: Implementation, b: Implementation) =>
  a.cairoVersion === b.cairoVersion &&
  isEqualAddress(a.accountClassHash, b.accountClassHash)

export function findImplementationForAccount(
  pubkey: string,
  account: Pick<WalletAccount, "address" | "classHash" | "cairoVersion">,
  additionalImplementations: Implementation[] = [],
): Implementation {
  const parsedAccountImplementation = implementationSchema.parse({
    cairoVersion: account.cairoVersion ?? "1",
    accountClassHash:
      account.classHash ?? ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES.CAIRO_1[0],
  })
  const parsedAdditionalImplementations = z
    .array(implementationSchema)
    .parse(additionalImplementations)

  const defaultImplementations = [
    ...ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES.CAIRO_0.map(
      (ch): Implementation => ({ cairoVersion: "0", accountClassHash: ch }),
    ),
    ...ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES.CAIRO_1.map(
      (ch): Implementation => ({ cairoVersion: "1", accountClassHash: ch }),
    ),
  ]

  const uniqueImplementations = uniqWith(
    [
      parsedAccountImplementation,
      ...parsedAdditionalImplementations,
      ...defaultImplementations,
    ],
    isEqualImplementation,
  )

  // calculate addresses for each implementation
  const implementationsWithAddresses = uniqueImplementations.map(
    (implementation) => ({
      implementation,
      address: getAccountContractAddress(
        implementation.cairoVersion,
        implementation.accountClassHash,
        pubkey,
      ),
    }),
  )

  // find the implementation that matches the account address
  const matchingImplementation = implementationsWithAddresses.find(
    (implementation) => isEqualAddress(implementation.address, account.address),
  )

  if (!matchingImplementation) {
    throw new AccountError({ code: "CALCULATED_ADDRESS_NO_MATCH" })
  }

  return matchingImplementation.implementation
}

export function getAccountDeploymentPayload(
  cairoVersion: string,
  accountClassHash: string,
  pubKey: string,
  /** @deprecated This is only used for backwards compatibility with the old proxy contract, should not be used */
  c0ProxyClassHash: string = C0_PROXY_CONTRACT_CLASS_HASHES[0],
) {
  const isDevnetImpl =
    cairoVersion !== "0" &&
    isEqualAddress(STANDARD_DEVNET_ACCOUNT_CLASS_HASH, accountClassHash)
  const implCalldata = {
    signer: pubKey,
    ...(isDevnetImpl ? {} : { guardian: "0" }),
  }
  const constructorCallData:
    | {
        signer: string
        guardian?: string
      }
    | {
        implementation: string
        selector: string
        calldata: Calldata
      } =
    cairoVersion === "0"
      ? {
          implementation: accountClassHash,
          selector: hash.getSelectorFromName("initialize"),
          calldata: CallData.compile(implCalldata),
        }
      : implCalldata

  const deployAccountPayload = {
    classHash: cairoVersion === "0" ? c0ProxyClassHash : accountClassHash,
    constructorCalldata: CallData.compile(constructorCallData),
    addressSalt: pubKey,
  }

  return deployAccountPayload
}

export function getAccountContractAddress(
  cairoVersion: string,
  accountClassHash: string,
  pubKey: string,
) {
  const deployAccountPayload = getAccountDeploymentPayload(
    cairoVersion,
    accountClassHash,
    pubKey,
  )

  return hash.calculateContractAddressFromHash(
    deployAccountPayload.addressSalt,
    deployAccountPayload.classHash,
    deployAccountPayload.constructorCalldata,
    0,
  )
}
