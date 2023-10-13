import { AddressBookAddOrEditScreen } from "@argent-x/extension/src/ui/features/settings/AddressBookAddOrEditScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: AddressBookAddOrEditScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    networkOptions: [
      {
        label: "Network 1",
        value: "network-1",
      },
      {
        label: "Network 2",
        value: "network-2",
      },
      {
        label: "Network 3",
        value: "network-3",
      },
    ],
  },
}

export const Address = {
  args: {
    ...Default.args,
    contact: {
      address:
        "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
    },
  },
}

export const Existing = {
  args: {
    ...Default.args,
    contact: {
      id: "123",
      name: "Foo Bar",
      address:
        "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
      networkId: "network-3",
    },
  },
}
