import { HideOrDeleteAccountConfirmScreen } from "@argent-x/extension/src/ui/features/accounts/HideOrDeleteAccountConfirmScreen"

import { account } from "../../account"
import { decorators } from "../../decorators/routerDecorators"

export default {
  component: HideOrDeleteAccountConfirmScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Delete = {
  args: {
    mode: "delete",
    accountName: "Account 1",
    accountAddress: account.address,
  },
}

export const Hide = {
  args: {
    mode: "hide",
    accountName: "Account 1",
    accountAddress: account.address,
  },
}
