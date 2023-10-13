import {
  AddressOrStarknetId,
  normalizeAddress,
  formatTruncatedAddress,
  isStarknetId,
  isValidAddress,
  getAccountIdentifier,
} from "@argent/shared"
import { icons } from "@argent/ui"
import { FC, ReactNode, useEffect, useMemo, useState } from "react"

import { useAppState } from "../../app.state"
import { getAddressFromStarkName } from "../../services/useStarknetId"
import { AccountListItem } from "../accounts/AccountListItem"
import { AccountListItemWithBalance } from "../accounts/AccountListItemWithBalance"
import { useAccountOrContact } from "./useAccountOrContact"
import { genericErrorSchema } from "../actions/feeEstimation/feeError"

const { WalletIcon } = icons

interface AccountAddressListItemProps {
  accountAddress: AddressOrStarknetId
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
  const [starknetAddress, setStarknetAddress] = useState("")
  const { switcherNetworkId } = useAppState()

  const isStarknetIdQuery = isStarknetId(accountAddress)

  const { contact, account } = useAccountOrContact(accountAddress)

  useEffect(() => {
    const init = async () => {
      if (!isStarknetIdQuery) {
        return
      }
      try {
        const starknetAddress = await getAddressFromStarkName(
          accountAddress,
          switcherNetworkId,
        )
        setStarknetAddress(starknetAddress)
      } catch (e) {
        const genericError = genericErrorSchema.safeParse(e)
        if (genericError.success) {
          setStarknetAddress(genericError.data.message)
        } else {
          setStarknetAddress(`${e}`)
        }
      }
    }
    void init()
  }, [accountAddress, isStarknetIdQuery, switcherNetworkId])

  const accountDescription = useMemo(() => {
    const address = isStarknetIdQuery ? starknetAddress : accountAddress
    if (!address) {
      return ""
    }
    if (isValidAddress(address)) {
      return truncated
        ? formatTruncatedAddress(address)
        : normalizeAddress(address)
    }
    return address
  }, [accountAddress, isStarknetIdQuery, starknetAddress, truncated])

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
      accountName={isStarknetIdQuery ? accountAddress : ""}
      accountAddress=""
      accountDescription={accountDescription}
      networkId={switcherNetworkId}
      avatarSize={9}
      avatarIcon={<WalletIcon />}
      onClick={onClick}
    >
      {fallbackAccessory}
    </AccountListItem>
  )
}
