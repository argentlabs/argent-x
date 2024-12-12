import type { PrettyAccountAddressProps } from "@argent/x-ui"
import { PrettyAccountAddress } from "@argent/x-ui"
import type { FC } from "react"
import { useMemo } from "react"

import type { AddressBookContact } from "../../../shared/addressBook/type"
import { useAddressBook } from "../../hooks/useAddressBook"
import { isEqualAddress } from "@argent/x-shared"
import type { AccountId } from "../../../shared/wallet.model"
import { useWalletAccount } from "./accounts.state"

const getContactNameForAddress = (
  accountAddress: string,
  networkId: string,
  contacts?: AddressBookContact[],
): string | undefined => {
  if (!contacts) {
    return
  }
  for (const contact of contacts) {
    if (
      contact.networkId === networkId &&
      isEqualAddress(contact.address, accountAddress)
    ) {
      return contact.name
    }
  }
}

export interface PrettyAccountAddressArgentXProps
  extends PrettyAccountAddressProps {
  accountId: AccountId // TODO: move to x-shared
  contacts?: AddressBookContact[]
}

/**
 * Same as `PrettyAccountAddress` but also retreives from ArgentX contacts
 */

export const PrettyAccountAddressArgentX: FC<
  PrettyAccountAddressArgentXProps
> = ({ accountId, accountAddress, networkId, contacts, ...rest }) => {
  const account = useWalletAccount(accountId)

  const { contacts: defaultContacts } = useAddressBook()
  if (!contacts) {
    contacts = defaultContacts
  }

  const accountName = useMemo(() => {
    const accountName = account?.name
    if (accountName) {
      return accountName
    }

    const contactName = getContactNameForAddress(
      accountAddress,
      networkId,
      contacts,
    )
    return contactName
  }, [accountAddress, account, contacts, networkId])

  return (
    <PrettyAccountAddress
      accountName={accountName}
      accountAddress={accountAddress}
      networkId={networkId}
      {...rest}
    />
  )
}
