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

  const pks: Uint8Array[] = []
  for (const path of derivationPaths) {
    const response = await ledger.getPubKey(path)
    if (hasResponseError(response)) {
      throw new Error(response.errorMessage)
    }
    pks.push(response.publicKey)
  }

  return pks
    .map((pk) => encode.addHexPrefix(encode.buf2hex(pk))) // convert to hex
    .map((xy) => xy.slice(0, 66)) // remove y coordinate and keep only x
}
