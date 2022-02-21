import DeleteIcon from "@mui/icons-material/Delete"
import { IconButton } from "@mui/material"
import { FC, MouseEventHandler } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { routes } from "../../routes"
import { useAccount } from "../../states/account"
import { useAppState } from "../../states/app"
import { makeClickable } from "../../utils/a11y"
import { truncateAddress } from "../../utils/addresses"
import { deleteAccount } from "../../utils/messaging"
import { recover } from "../../utils/recovery"
import { WalletStatus, getAccountImageUrl } from "../../utils/wallets"
import {
  NetworkStatusIndicator,
  NetworkStatusWrapper,
} from "../NetworkSwitcher"
import { AccountColumn } from "./AccountColumn"
import { AccountRow } from "./AccountRow"
import { ProfilePicture } from "./ProfilePicture"

export const DeleteAccountButton = styled(NetworkStatusWrapper)`
  display: none;
`

export const AccountListItemWrapper = styled.div`
  cursor: pointer;
  height: 76px;
  width: 256px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 20px 16px;

  display: flex;
  gap: 12px;
  align-items: center;

  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    background: rgba(255, 255, 255, 0.25);
    outline: 0;

    &.deleteable ${NetworkStatusWrapper} {
      display: none;
    }
    &.deleteable ${DeleteAccountButton} {
      display: flex;
    }
  }
`

const AccountStatusText = styled.p`
  font-size: 10px;
  font-weight: 400;
  line-height: 12px;
  text-align: center;
`

const AccountName = styled.h1`
  font-weight: 700;
  font-size: 18px;
  line-height: 18px;
  margin: 0 0 5px 0;
`

interface AccountListProps {
  accountName: string | undefined
  accountNumber: number
  address: string
  status: WalletStatus
  isDeleteable?: boolean
}

export const AccountListItem: FC<AccountListProps> = ({
  accountName,
  accountNumber,
  address,
  status,
  isDeleteable,
}) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()

  const handleDeleteClick: MouseEventHandler = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    await deleteAccount(address)
    await recover({ networkId: switcherNetworkId })
  }

  return (
    <AccountListItemWrapper
      {...makeClickable(() => {
        useAccount.setState({ selectedWallet: address })
        navigate(routes.account())
      })}
      className={isDeleteable ? "deleteable" : ""}
    >
      <ProfilePicture src={getAccountImageUrl(accountName, accountNumber)} />
      <AccountRow>
        <AccountColumn>
          <AccountName>{accountName}</AccountName>
          <p>{truncateAddress(address)}</p>
        </AccountColumn>
        <NetworkStatusWrapper>
          <NetworkStatusIndicator status={status.code} />
          <AccountStatusText>{status.text}</AccountStatusText>
        </NetworkStatusWrapper>
        <DeleteAccountButton>
          <IconButton color="error" onClick={handleDeleteClick}>
            <DeleteIcon />
          </IconButton>
        </DeleteAccountButton>
      </AccountRow>
    </AccountListItemWrapper>
  )
}
