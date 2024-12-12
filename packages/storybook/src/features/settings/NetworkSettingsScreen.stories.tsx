import { NetworkSettingsScreen } from "@argent-x/extension/src/ui/features/settings/advanced/manageNetworks/NetworkSettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: NetworkSettingsScreen,
  decorators,
}

export const Populated = {
  args: {
    allNetworks: [
      {
        name: "Foo network",
        readonly: true,
      },
      {
        name: "Bar network",
        readonly: true,
      },
      {
        name: "Baz network",
      },
      {
        name: "Lorem ipsum dolor sit amet network",
      },
      {
        name: "Readonly lorem ipsum dolor sit amet network",
        readonly: true,
      },
      {
        name: "Foo network",
        readonly: true,
      },
      {
        name: "Bar network",
        readonly: true,
      },
      {
        name: "Baz network",
      },
      {
        name: "Lorem ipsum dolor sit amet network",
      },
      {
        name: "Readonly lorem ipsum dolor sit amet network",
        readonly: true,
      },
    ],
  },
}

export const PopulatedDefault = {
  args: {
    ...Populated.args,
    isDefaultCustomNetworks: true,
  },
}

export const Empty = {
  args: {
    allNetworks: [],
  },
}
