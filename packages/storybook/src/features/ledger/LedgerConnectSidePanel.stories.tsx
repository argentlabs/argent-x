import {
  LedgerConnectSidePanel,
  LedgerConnectSidePanelProps,
} from "@argent-x/extension/src/ui/features/ledger/LedgerConnect/LedgerConnectSidePanel"

export default {
  component: LedgerConnectSidePanel,
  render: (props: LedgerConnectSidePanelProps) => {
    return <LedgerConnectSidePanel h="100vh" {...props} />
  },
}

export const Default = {
  args: {},
}
