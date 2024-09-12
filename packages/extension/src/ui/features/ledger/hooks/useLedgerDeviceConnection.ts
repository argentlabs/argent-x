import { atom, useAtom } from "jotai"
import { useEffect } from "react"
import { LEDGER_VENDOR_ID } from "../../../../shared/ledger/constants"
import { hasConnectedLedgerDevice } from "../utils"
import browser from "webextension-polyfill"
import { useIsFirefox } from "../../../hooks/useUserAgent"

export const ledgerDeviceConnectionAtom = atom(false)

export function useLedgerDeviceConnection() {
  const [ledgerDeviceConnected, setLedgerDeviceConnected] = useAtom(
    ledgerDeviceConnectionAtom,
  )

  const isFirefox = useIsFirefox()

  const onConnect = ({ device }: HIDConnectionEvent) => {
    if (device.vendorId === LEDGER_VENDOR_ID) {
      setLedgerDeviceConnected(true)
    }
  }

  const onDisconnect = ({ device }: HIDConnectionEvent) => {
    if (device.vendorId === LEDGER_VENDOR_ID) {
      setLedgerDeviceConnected(false)
    }
  }

  const detectLedgerDevice = () =>
    hasConnectedLedgerDevice().then(setLedgerDeviceConnected)

  useEffect(() => {
    // Set the initial state
    if (!isFirefox) {
      void detectLedgerDevice()
      navigator.hid.addEventListener("connect", onConnect)
      navigator.hid.addEventListener("disconnect", onDisconnect)
      browser.windows.onFocusChanged.addListener(detectLedgerDevice)

      return () => {
        navigator.hid.removeEventListener("connect", onConnect)
        navigator.hid.removeEventListener("disconnect", onDisconnect)
        browser.windows.onFocusChanged.removeListener(detectLedgerDevice)
      }
    }
  }, [])

  return ledgerDeviceConnected
}
