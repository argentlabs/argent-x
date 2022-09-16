import LedgerStark from "@ledgerhq/hw-app-starknet"
import type Transport from "@ledgerhq/hw-transport"
import { encode } from "starknet"

export function hasResponseError<T extends { errorMessage?: string }>(
  response: T,
): boolean {
  return Boolean(response.errorMessage && response.errorMessage !== "No errors")
}

export function getLedger(
  transportOrLedger: Transport | LedgerStark,
): LedgerStark {
  if (transportOrLedger instanceof LedgerStark) {
    return transportOrLedger
  }
  return new LedgerStark(transportOrLedger)
}

export async function getPublicKeys(
  transportOrLedger: Transport | LedgerStark,
  derivationPaths: string[],
) {
  const ledger = getLedger(transportOrLedger)
  const pks = await Promise.all(derivationPaths.map((p) => ledger.getPubKey(p)))
  if (pks.some(hasResponseError)) {
    throw new Error(
      pks
        .filter(hasResponseError)
        .map((pk) => pk.errorMessage)
        .join(" & "),
    )
  }
  console.log("pks", pks)
  return pks.map((pk) => encode.addHexPrefix(encode.buf2hex(pk.publicKey)))
}
