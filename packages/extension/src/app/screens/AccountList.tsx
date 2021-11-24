import { FC } from "react"
import styled from "styled-components"

import Add from "../../assets/add.svg"
import Settings from "../../assets/settings.svg"
import { AccountList, AccountListItem } from "../components/Account/List"
import { IconButton } from "../components/IconButton"
import { H2 } from "../components/Typography"
import { makeClickable } from "../utils/a11y"
import { getStatus } from "../utils/wallet"
import { Wallet } from "../Wallet"

const AccountListWrapper = styled.div`
  padding: 48px 32px;
  display: flex;
  flex-direction: column;

  ${H2} {
    text-align: start;
    margin: 0;
  }

  > ${AccountList} {
    margin-top: 32px;
    width: 100%;
  }
`

const IconButtonCenter = styled(IconButton)`
  margin: auto;
`

const AccountRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

interface AccountListPageProps {
  onAccountSelect?: (account: string) => void
  onAddAccount?: () => void
  onSettings?: () => void
  wallets: Wallet[]
  activeWallet: string
}

export const AccountListScreen: FC<AccountListPageProps> = ({
  onAccountSelect = noop,
  onAddAccount = noop,
  onSettings = noop,
  wallets,
  activeWallet,
}) => {
  return (
    <AccountListWrapper>
      <AccountRow>
        <H2>Accounts</H2>
        <IconButton size={32} {...makeClickable(onSettings, 99)}>
          <Settings />
        </IconButton>
      </AccountRow>
      <AccountList>
        {wallets.map((wallet, index) => (
          <AccountListItem
            key={wallet.address}
            accountNumber={index + 1}
            address={wallet.address}
            status={getStatus(wallet, activeWallet)}
            onClick={() => onAccountSelect(wallet.address)}
          />
        ))}
        <IconButtonCenter size={48} {...makeClickable(onAddAccount)}>
          <Add />
        </IconButtonCenter>
      </AccountList>
    </AccountListWrapper>
  )
}
