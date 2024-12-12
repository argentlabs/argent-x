import { AccountListHiddenScreen } from "@argent-x/extension/src/ui/features/accounts/AccountListHiddenScreen"
import { accounts } from "@argent-x/extension/src/ui/features/actions/__fixtures__"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: AccountListHiddenScreen,
  decorators,
}

export const Default = {
  args: {
    accounts,
    hiddenPendingMultisigAccounts: [
      {
        name: "Multi Sig",
        type: "multisig",
        hidden: true,
        publicKey: "0xabc",
      },
    ],
  },
}
