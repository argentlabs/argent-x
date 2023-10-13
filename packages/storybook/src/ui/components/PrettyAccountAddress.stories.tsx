import { PrettyAccountAddress } from "@argent/ui"

export default {
  component: PrettyAccountAddress,
}

export const Default = {
  args: {
    accountAddress:
      "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
    networkId: "goerli-alpha",
  },
}

export const ContactAddress = {
  args: {
    ...Default.args,
    accountName: "Lorem ipsum",
  },
}

export const FallbackAddress = {
  args: {
    ...Default.args,
    fallbackValue: (accountAddreess: string) =>
      `Lorem ipsum ${accountAddreess}`,
  },
}
