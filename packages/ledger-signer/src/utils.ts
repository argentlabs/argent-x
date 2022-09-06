import LedgerStark from "@ledgerhq/hw-app-starknet"
import type Transport from "@ledgerhq/hw-transport"
import { encode } from "starknet"

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
  console.log(pks)
  if (pks.some((pk) => pk.errorMessage)) {
    throw new Error(
      pks
        .map((pk) => pk.errorMessage)
        .filter(Boolean)
        .join(" & "),
    )
  }
  return pks.map((pk) => encode.addHexPrefix(encode.buf2hex(pk.publicKey)))
}
