import { useCallback } from "react"
import { ledgerService } from "../../../services/ledger"
import { LEDGER_VENDOR_ID } from "../../../../shared/ledger/constants"
import { AxLedgerError } from "../../../../shared/errors/ledger"

export function useLedgerConnectCallback() {
  return useCallback(async () => {
    // Check for connected devices
    const devices = await navigator.hid.getDevices()
    let ledgerDevices = devices.filter(
      (device) => device.vendorId === LEDGER_VENDOR_ID,
    )

    // If no ledger devices are connected, request one
    if (ledgerDevices.length === 0) {
      ledgerDevices = await navigator.hid.requestDevice({
        filters: [
          {
            vendorId: LEDGER_VENDOR_ID,
          },
        ],
      })
    }

    if (!ledgerDevices.length) {
      throw new AxLedgerError({ code: "NO_DEVICE_FOUND" })
    }

    // Make sure the connection can be established from the background
    const connection = await ledgerService.connect()
    return !!connection
  }, [])
}
