import { AccountListScreen } from "@argent-x/extension/src/ui/features/accounts/AccountListScreen"

import { decorators } from "../../decorators/routerDecorators"

/** TODO: refactor - this does not work until AccountListScreenItem is made context-free */

export default {
  component: AccountListScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    title: "Foo bar Accounts",
    deprecatedAccounts: [
      {
        name: "Depreacted 1",
        address: "0x123",
        networkId: "goerli-alpha",
      },
    ],
    hiddenAccounts: [
      {
        name: "Hidden 1",
        address: "0x123",
        networkId: "goerli-alpha",
      },
    ],
    hiddenPendingMultisigs: [
      {
        name: "Hidden Pending Multisig 1",
        type: "multisig",
        hidden: true,
        publicKey: "0xabc",
      },
    ],
    multisigAccounts: [
      {
        name: "Multisig 1",
        type: "multisig",
        hidden: true,
        publicKey: "0xabc",
      },
    ],
    newAccounts: [
      {
        name: "New 1",
        address: "0x123",
        networkId: "goerli-alpha",
      },
    ],
    pendingMultisigs: [
      {
        name: "Pending Multisig 1",
        type: "multisig",
        hidden: true,
        publicKey: "0xabc",
      },
    ],
    standardAccounts: [
      {
        name: "Standard 1",
        address: "0x123",
        networkId: "goerli-alpha",
      },
    ],
    visibleAccounts: [
      {
        name: "Visible 1",
        address: "0x123",
        networkId: "goerli-alpha",
      },
    ],
    visiblePendingMultisigs: [
      {
        name: "Visible Pending Multisig 1",
        type: "multisig",
        hidden: true,
        publicKey: "0xabc",
      },
    ],
  },
}
