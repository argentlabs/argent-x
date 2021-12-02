import { FC, Suspense } from "react"
import styled from "styled-components"

import Add from "../../assets/add.svg"
import { AccountSubHeader } from "../components/Account/AccountSubheader"
import { AccountColumn, AccountHeader } from "../components/Account/Header"
import { ProfilePicture } from "../components/Account/ProfilePicture"
import { TokenList } from "../components/Account/TokenList"
import { NetworkSwitcher } from "../components/NetworkSwitcher"
import { Spinner } from "../components/Spinner"
import {
  AddTokenIconButton,
  TokenAction,
  TokenTitle,
  TokenWrapper,
} from "../components/Token"
import { useStatus } from "../hooks/useStatus"
import { makeClickable } from "../utils/a11y"
import { TokenDetails } from "../utils/tokens"
import { getAccountImageUrl } from "../utils/wallet"
import { Wallet } from "../Wallet"

const AccountContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`

interface AccountScreenProps {
  wallet: Wallet
  accountNumber: number
  onShowAccountList?: () => void
  onShowToken: (token: TokenDetails) => void
  onAddToken?: () => void
  onAction?: (token: string, action: TokenAction) => Promise<void> | void
  networkId: string
  onChangeNetwork: (networkId: string) => Promise<void> | void
}

export const AccountScreen: FC<AccountScreenProps> = ({
  wallet,
  accountNumber,
  onShowAccountList,
  onShowToken,
  onAddToken,
  onAction,
  networkId,
  onChangeNetwork,
}) => {
  const status = useStatus(wallet)
  return (
    <AccountColumn>
      <AccountHeader>
        <ProfilePicture
          {...makeClickable(onShowAccountList)}
          src={getAccountImageUrl(accountNumber)}
        />
        <NetworkSwitcher
          networkId={networkId}
          onChangeNetwork={onChangeNetwork}
        />
      </AccountHeader>
      <AccountContent>
        <AccountSubHeader
          networkId={networkId}
          status={status}
          accountNumber={accountNumber}
          walletAddress={wallet.address}
        />
        <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
          <TokenList
            networkId={networkId}
            onAction={onAction}
            onShowToken={onShowToken}
            walletAddress={wallet.address}
          />
          <TokenWrapper {...makeClickable(onAddToken)}>
            <AddTokenIconButton size={40}>
              <Add />
            </AddTokenIconButton>
            <TokenTitle>Add token</TokenTitle>
          </TokenWrapper>
        </Suspense>
      </AccountContent>
    </AccountColumn>
  )
}
