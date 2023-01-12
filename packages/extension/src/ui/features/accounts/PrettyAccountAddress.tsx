import { P4 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { ComponentProps, FC, ReactNode, useMemo } from "react"

import { AddressBookContact } from "../../../shared/addressBook"
import { useAddressBook } from "../../services/addressBook"
import {
  formatTruncatedAddress,
  isEqualAddress,
} from "../../services/addresses"
import { TokenIcon } from "../accountTokens/TokenIcon"
import { useAccountMetadata } from "./accountMetadata.state"
import { getNetworkAccountImageUrl } from "./accounts.service"

const getAccountNameForAddress = (
  accountAddress: string,
  networkId: string,
  accountNames?: Record<string, Record<string, string>>,
): string | undefined => {
  if (!accountNames || !accountNames[networkId]) {
    return
  }
  for (const entry of Object.entries(accountNames[networkId])) {
    const [address, accountName] = entry
    if (isEqualAddress(address, accountAddress)) {
      return accountName
    }
  }
}

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
  accountNames?: Record<string, Record<string, string>>
  contacts?: AddressBookContact[]
  fallbackValue?: (accountAddress: string) => ReactNode
  icon?: boolean
  bold?: boolean
}

export const PrettyAccountAddress: FC<PrettyAccountAddressProps> = ({
  accountAddress,
  networkId,
  accountNames,
  contacts,
  size = 10,
  fallbackValue,
  icon = true,
  bold = false,
}) => {
  const defaultAccountNames = useAccountMetadata((x) => x.accountNames)
  const { contacts: defaultContacts } = useAddressBook()
  if (!accountNames) {
    accountNames = defaultAccountNames
  }
  if (!contacts) {
    contacts = defaultContacts
  }
  const accountName = useMemo(() => {
    const accountName = getAccountNameForAddress(
      accountAddress,
      networkId,
      accountNames,
    )
    if (accountName) {
      return accountName
    }
    const contactName = getContactNameForAddress(
      accountAddress,
      networkId,
      contacts,
    )
    return contactName
  }, [accountAddress, accountNames, contacts, networkId])
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
