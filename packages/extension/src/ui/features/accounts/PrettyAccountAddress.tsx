import { P4 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { ComponentProps, FC, ReactNode, useMemo } from "react"

import { AddressBookContact } from "../../../shared/addressBook"
import { useAddressBook } from "../../services/addressBook"
import {
  formatTruncatedAddress,
  isEqualAddress,
} from "../../services/addresses"
import { accountFindFamily } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { TokenIcon } from "../accountTokens/TokenIcon"
import { getNetworkAccountImageUrl } from "./accounts.service"

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

interface PrettyAccountAddressProps
  extends Pick<ComponentProps<typeof TokenIcon>, "size"> {
  accountAddress: string
  networkId: string
  accountNames?: string[]
  contacts?: AddressBookContact[]
  fallbackValue?: (accountAddress: string) => ReactNode
  icon?: boolean
  bold?: boolean
}

export const PrettyAccountAddress: FC<PrettyAccountAddressProps> = ({
  accountAddress,
  networkId,
  contacts,
  size = 10,
  fallbackValue,
  icon = true,
  bold = false,
}) => {
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
  const accountImageUrl = getNetworkAccountImageUrl({
    accountName: accountName || accountAddress,
    networkId,
    accountAddress,
  })
  const accountDisplayName = accountName
    ? accountName
    : fallbackValue
    ? fallbackValue(accountAddress)
    : formatTruncatedAddress(accountAddress)

  if (accountDisplayName && !icon) {
    return <>{accountDisplayName}</>
  }
  return (
    <Flex alignItems={"center"} gap={2}>
      {icon && accountName && (
        <TokenIcon url={accountImageUrl} name={accountAddress} size={size} />
      )}
      {bold ? (
        <P4 fontWeight="bold" color="white">
          {accountDisplayName}
        </P4>
      ) : (
        accountDisplayName
      )}
    </Flex>
  )
}
