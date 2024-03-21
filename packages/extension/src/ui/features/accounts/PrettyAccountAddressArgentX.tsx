import { PrettyAccountAddress, PrettyAccountAddressProps } from "@argent/x-ui"
import { FC, useMemo } from "react"

import type { AddressBookContact } from "../../../shared/addressBook/type"
import { useAddressBook } from "../../hooks/useAddressBook"
import { accountFindFamily } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { isEqualAddress } from "@argent/x-shared"

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
  contacts?: AddressBookContact[]
}

/**
 * Same as `PrettyAccountAddress` but also retreives from ArgentX contacts
 */

export const PrettyAccountAddressArgentX: FC<
  PrettyAccountAddressArgentXProps
> = ({ accountAddress, networkId, contacts, ...rest }) => {
  const account = useView(
    accountFindFamily({
      networkId,
      address: accountAddress,
    }),
  )

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
