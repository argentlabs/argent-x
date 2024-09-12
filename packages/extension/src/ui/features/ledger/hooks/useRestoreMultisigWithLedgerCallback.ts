import { useCallback, useState } from "react"
import { ledgerService } from "../../../services/ledger"
import { addressSchema, encodeBase58 } from "@argent/x-shared"

export function useRestoreMultisigWithLedgerCallback(networkId: string) {
  const [loading, setLoading] = useState(true)

  const restoreMultisigWithLedger = useCallback(async () => {
    try {
      const multisigs = await ledgerService.restoreMultisig(networkId)
      return multisigs.map(({ pubKey, account }) => ({
        signerKey: encodeBase58(pubKey),
        address: addressSchema.parse(account.address),
      }))
    } catch (e) {
      console.error(e)
      return []
    } finally {
      setLoading(false)
    }
  }, [networkId])

  return { restoreMultisigWithLedger, loading }
}
