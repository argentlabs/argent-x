import { AddressBookSettingsScreen } from "@argent-x/extension/src/ui/features/settings/addressBook/AddressBookSettingsScreen"

import { decorators } from "../../decorators/routerDecorators"
import { addressBook } from "../accounts/__fixtures__/addressBook"

export default {
  component: AddressBookSettingsScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    contacts: addressBook.contacts,
  },
}

export const Empty = {
  args: {
    contacts: [],
  },
}
