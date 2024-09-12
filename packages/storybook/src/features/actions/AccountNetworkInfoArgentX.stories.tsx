import { AccountNetworkInfoArgentX } from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen/AccountNetworkInfoArgentX"

export default {
  component: AccountNetworkInfoArgentX,
}

export const Default = {
  args: {
    account: {
      address:
        "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
      networkId: "sepolia-alpha",
      network: {
        name: "Foo bar network",
      },
    },
  },
}
