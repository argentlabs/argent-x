import { memoize } from "lodash-es"

import { AddressBookAccount } from "./type"

export const accountNetworkSelector = memoize(
  (networkId: string) => (account: AddressBookAccount) =>
    account.networkId === networkId,
)
