import { useCallback } from "react"
import create from "zustand"

import { defaultNetwork } from "../../../shared/network"
import { IAccountListItem } from "../accounts/AccountListItem"

export const listOfAccounts: IAccountListItem[] = [
  {
    accountAddress:
      "0x04483e2798fb2763773775d9b055a87deca913806b9e41c18ffa67bd6d826641",
    accountName: "Ledger Account 1",
    accountType: "argent-ledger",
    networkId: defaultNetwork.id,
  },
  {
    accountAddress:
      "0x02A7f765dC8a9030e3Ec393F51D5b0244a21AE55b71485F1142474b3c254537e",
    accountName: "Ledger Account 2",
    accountType: "argent-ledger",
    networkId: defaultNetwork.id,
  },
]

const useSelectedLedgerAccountStore = create<{ selected: IAccountListItem }>(
  () => ({
    selected: listOfAccounts[0],
  }),
)

export const useSelectedLedgerAccount = () => {
  const selected = useSelectedLedgerAccountStore((state) => state.selected)
  const setSelected = useCallback((account: IAccountListItem) => {
    useSelectedLedgerAccountStore.setState({ selected: account })
  }, [])

  return [selected, setSelected] as const
}
