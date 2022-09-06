import { FC, ReactNode, useMemo } from "react"
import styled from "styled-components"

import { AddressBookContact } from "../../../shared/addressBook"
import { useAddressBook } from "../../services/addressBook"
import {
  formatTruncatedAddress,
  isEqualAddress,
} from "../../services/addresses"
import { TokenIcon, TokenIconProps } from "../accountTokens/TokenIcon"
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

const Container = styled.div`
  display: flex;
  align-items: center;
`

const TokenIconContainer = styled.div`
  margin-right: 8px;
  display: flex;
  align-items: center;
`

interface IPrettyAccountAddress
  extends Pick<TokenIconProps, "large" | "small" | "size"> {
  accountAddress: string
  networkId: string
  accountNames?: Record<string, Record<string, string>>
  contacts?: AddressBookContact[]
  fallbackValue?: (accountAddress: string) => ReactNode
}

export const PrettyAccountAddress: FC<IPrettyAccountAddress> = ({
  accountAddress,
  networkId,
  accountNames,
  contacts,
  large,
  small,
  size,
  fallbackValue,
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
  return (
    <Container>
      {accountName && (
        <TokenIconContainer>
          <TokenIcon
            url={accountImageUrl}
            name={accountAddress}
            large={large}
            small={small}
            size={size}
          />
        </TokenIconContainer>
      )}
      {accountName
        ? accountName
        : fallbackValue
        ? fallbackValue(accountAddress)
        : formatTruncatedAddress(accountAddress)}
    </Container>
  )
}
