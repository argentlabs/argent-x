import {
  AddressOrDomain,
  normalizeAddress,
  formatTruncatedAddress,
  isValidAddress,
  getAccountIdentifier,
  isStarknetDomainName,
} from "@argent/x-shared"
import { iconsDeprecated } from "@argent/x-ui"
import { FC, ReactNode, useEffect, useMemo, useState } from "react"

import { AccountListItem } from "../accounts/AccountListItem"
import { AccountListItemWithBalance } from "../accounts/AccountListItemWithBalance"
import { useAccountOrContact } from "./useAccountOrContact"
import { useGetAddressFromDomainName } from "../send/useGetAddressFromDomainName"
import { useView } from "../../views/implementation/react"
import { selectedNetworkIdView } from "../../views/network"

const { WalletIcon } = iconsDeprecated

interface AccountAddressListItemProps {
  accountAddress: AddressOrDomain
  onClick?: () => void
  fallbackAccessory?: ReactNode
  truncated?: boolean
}

export const AccountAddressListItem: FC<AccountAddressListItemProps> = ({
  accountAddress,
  onClick,
  fallbackAccessory,
  truncated = false,
}) => {
  const [addressFromDomain, setAddressFromDomain] = useState("")
  const selectedNetworkId = useView(selectedNetworkIdView)

  const isStarknetDomainNameAddress = isStarknetDomainName(accountAddress)

  const { result, error } = useGetAddressFromDomainName(
    accountAddress,
    selectedNetworkId,
  )

  const { contact, account } = useAccountOrContact(accountAddress)

  useEffect(() => {
    if (!isStarknetDomainNameAddress) {
      return
    }
    if (result) {
      setAddressFromDomain(result)
    } else if (error) {
      setAddressFromDomain(error)
    }
  }, [
    accountAddress,
    error,
    isStarknetDomainNameAddress,
    result,
    selectedNetworkId,
  ])

  const accountDescription = useMemo(() => {
    const address = isStarknetDomainNameAddress
      ? addressFromDomain
      : accountAddress
    if (!address) {
      return ""
    }
    if (isValidAddress(address)) {
      return truncated
        ? formatTruncatedAddress(address)
        : normalizeAddress(address)
    }
    return address
  }, [
    accountAddress,
    isStarknetDomainNameAddress,
    addressFromDomain,
    truncated,
  ])

  if (account) {
    const key = getAccountIdentifier(account)
    return (
      <AccountListItemWithBalance
        key={key}
        account={account}
        avatarSize={9}
        accountAddress={account.address}
        networkId={account.networkId}
        accountName={account.name}
        onClick={onClick}
        isSmartAccount={account.type === "smart"}
        isLedger={account.signer.type === "ledger"}
      />
    )
  }

  if (contact) {
    const key = getAccountIdentifier(contact)
    return (
      <AccountListItem
        key={key}
        avatarSize={9}
        accountAddress={contact.address}
        networkId={contact.networkId}
        accountName={contact.name}
        onClick={onClick}
      />
    )
  }

  return (
    <AccountListItem
      accountName={isStarknetDomainNameAddress ? accountAddress : ""}
      accountAddress=""
      accountDescription={accountDescription}
      networkId={selectedNetworkId}
      avatarSize={9}
      avatarIcon={<WalletIcon />}
      onClick={onClick}
    >
      {fallbackAccessory}
    </AccountListItem>
  )
}
