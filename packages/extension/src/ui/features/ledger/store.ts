import { getPublicKeys } from "@argent/ledger-signer"
import LedgerUsbTransport from "@ledgerhq/hw-transport-webusb"
import { useCallback } from "react"
import create from "zustand"

import { getPathForIndex } from "../../../background/keys/keyDerivation"
import { IAccountListItem } from "../accounts/AccountListItem"
import { getAccountByPubKey } from "./utils"

export const getListOfAccounts = async (
  prevAccounts?: IAccountListItem[],
): Promise<IAccountListItem[]> => {
  const tp = await LedgerUsbTransport.create().catch((e) => {
    console.error(e)
    throw new Error("No Ledger device found")
  })

  const derivationPaths = Array(10)
    .fill(0)
    .map((_, i) => getPathForIndex(i, "m/2645'/1195502025'/1148870696'/0'/0'"))
  const pubkeys = await getPublicKeys(tp, derivationPaths)

  const accounts = await Promise.all(
    pubkeys.map((pk) =>
      getAccountByPubKey(
        pk,
        "goerli-alpha",
        "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918",
        "0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328",
      ),
    ),
  )

  const listOfAccounts: IAccountListItem[] = accounts.map((a, i) => ({
    accountAddress: a.address,
    accountName: `Ledger Account ${i + 1}`,
    accountType: "argent-ledger",
    networkId: a.networkId,
  }))

  return prevAccounts ? [...prevAccounts, ...listOfAccounts] : listOfAccounts
}

const useSelectedLedgerAccountStore = create<{ selected?: IAccountListItem }>(
  () => ({}),
)

export const useSelectedLedgerAccount = () => {
  const selected = useSelectedLedgerAccountStore((state) => state.selected)
  const setSelected = useCallback((account: IAccountListItem) => {
    useSelectedLedgerAccountStore.setState({ selected: account })
  }, [])

  return [selected, setSelected] as const
}
