import { AccountScreenEmpty } from "@argent-x/extension/src/ui/features/accounts/AccountScreenEmpty"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: AccountScreenEmpty,
  decorators,
}

export const Default = {
  args: {
    currentNetworkName: "Foo bar network",
  },
}

export const AllHidden = {
  args: {
    hasHiddenAccounts: true,
    currentNetworkName: "Foo bar network",
  },
}
