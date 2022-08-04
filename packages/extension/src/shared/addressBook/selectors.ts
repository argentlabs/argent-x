import { memoize } from "lodash-es"

import { AddressBookContact } from "./type"

export const accountNetworkSelector = memoize(
  (networkId: string) => (account: AddressBookContact) =>
    account.networkId === networkId,
)
