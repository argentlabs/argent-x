import type { AddressOrDomain } from "@argent/x-shared"
import {
  normalizeAddress,
  formatTruncatedAddress,
  isValidAddress,
} from "@argent/x-shared"
import { WalletSecondaryIcon } from "@argent/x-ui/icons"
import type { FC, ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { starknetId } from "starknet"
import { AccountListItem } from "../accounts/AccountListItem"
import { AccountListItemWithBalance } from "../accounts/AccountListItemWithBalance"
import { useAccountOrContact } from "./useAccountOrContact"
import { useGetAddressFromDomainName } from "../send/useGetAddressFromDomainName"
import { useView } from "../../views/implementation/react"
import { selectedNetworkIdView } from "../../views/network"
import { P4 } from "@argent/x-ui"

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

  const isStarknetDomainNameAddress = starknetId.isStarkDomain(accountAddress)

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
    return (
      <AccountListItemWithBalance
        key={account.id}
        account={account}
        accountType={account.type}
        avatarSize={9}
        accountAddress={account.address}
        networkId={account.networkId}
        accountId={account.id}
        accountName={account.name}
        avatarMeta={account.avatarMeta}
        onClick={onClick}
        isSmartAccount={account.type === "smart"}
        isLedger={account.signer.type === "ledger"}
      />
    )
  }

  if (contact) {
    return (
      <AccountListItem
        key={contact.id}
        avatarSize={9}
        accountAddress={contact.address}
        networkId={contact.networkId}
        accountId={contact.id}
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
      accountId={`${accountAddress}-${selectedNetworkId}`}
      avatarSize={9}
      avatarIcon={<WalletSecondaryIcon />}
      onClick={onClick}
    >
      {fallbackAccessory}
    </AccountListItem>
  )
}
