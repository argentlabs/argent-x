import { AccountNetworkInfo } from "@argent/ui"

export default {
  component: AccountNetworkInfo,
}

/*
    accountAddress: string;
    accountName?: string;
    networkId: string;
    networkName: string;
    to?: string;
*/

export const Default = {
  args: {
    accountAddress:
      "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
    networkId: "goerli-alpha",
    networkName: "Foo bar network",
  },
}

export const AccountName = {
  args: {
    ...Default.args,
    accountName: "Foo bar account name",
  },
}

export const To = {
  args: {
    ...Default.args,
    to: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
  },
}
