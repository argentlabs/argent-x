import { AccountListHiddenScreen } from "@argent-x/extension/src/ui/features/accounts/AccountListHiddenScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: AccountListHiddenScreen,
  decorators,
}

export const Default = {
  args: {
    hiddenAccounts: [
      {
        name: "Account 1 Lorem Ipsum Dolor Sit Amet",
        address: "0x123",
        networkId: "goerli-alpha",
      },
    ],
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
