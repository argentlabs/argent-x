import { PrettyAccountAddressArgentX } from "@argent-x/extension/src/ui/features/accounts/PrettyAccountAddressArgentX"

const accountNames = {
  "sepolia-alpha": {
    "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a":
      "Account name 1",
  },
}

const contacts = [
  {
    address:
      "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
    id: "4ZqlfM0l4BLtgNtpKP1bC",
    name: "Address book contact name 1",
    networkId: "sepolia-alpha",
  },
]

export default {
  component: PrettyAccountAddressArgentX,
}

export const AccountAddress = {
  args: {
    accountNames,
    contacts,
    accountAddress:
      "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
    networkId: "sepolia-alpha",
  },
}

export const ContactAddress = {
  args: {
    accountNames,
    contacts,
    accountAddress:
      "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
    networkId: "sepolia-alpha",
  },
}

export const Unknown = {
  args: {
    accountNames,
    contacts,
    accountAddress: "0x0",
    networkId: "sepolia-alpha",
  },
}
