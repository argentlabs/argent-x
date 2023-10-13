import { AddressBookMenu } from "@argent-x/extension/src/ui/features/accounts/AddressBookMenu"

import { addressBook } from "./__fixtures__/addressBook"

export default {
  component: AddressBookMenu,
}

export const Default = {
  args: {
    addressBook,
  },
}

export const NoContacts = {
  args: {
    addressBook: {
      userAccounts: addressBook.userAccounts,
    },
  },
}
