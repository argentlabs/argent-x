import { UAParser } from "ua-parser-js"
import { LEDGER_VENDOR_ID } from "../../../../shared/ledger/constants"
import { SignerType, WalletAccount } from "../../../../shared/wallet.model"

export async function hasConnectedLedgerDevice() {
  const uaParser = new UAParser()
  const browser = uaParser.getBrowser()
  if (browser.name === "Firefox") {
    return false
  }
  const devices = await navigator.hid.getDevices()
  return devices.some((device) => device.vendorId === LEDGER_VENDOR_ID)
}

export const isLedgerSigner = ({ signer }: Pick<WalletAccount, "signer">) =>
  signer.type === SignerType.LEDGER
