/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import { FC, Suspense } from "react"
import Copy from "../../assets/copy.svg"
import Qr from "../../assets/qr.svg"
import Add from "../../assets/add.svg"
import LoadingGif from "../../assets/loading.gif"
import {
  AccountColumn,
  AccountRow,
  AccountHeader,
} from "../components/Account/Header"
import {
  AccountNetwork,
  AccountStatusWrapper,
  AccountStatusText,
  AccountStatusIndicator,
} from "../components/Account/Network"
import {
  AccountName,
  AccountAddressWrapper,
  AccountAddressIconsWrapper,
  AccountAddress,
} from "../components/Account/Address"
import { ProfilePicture } from "../components/Account/ProfilePicture"
import { getProfileImageUrl, getProfileName } from "../utils/wallet"
import { makeClickable } from "../utils/a11y"
import { useStatus } from "../hooks/useStatus"
import CopyToClipboard from "react-copy-to-clipboard"
import { Wallet } from "../Wallet"
import styled from "styled-components"
import {
  AddTokenIconButton,
  TokenAction,
  TokenListItem,
  TokenTitle,
  TokenWrapper,
} from "../components/Token"
import { useMitt } from "../hooks/useMitt"
import {
  fetchTokenDetails,
  getTokens,
  TokenDetails,
  tokensMitt,
} from "../utils/tokens"
import usePromise from "react-promise-suspense"
import { ethers } from "ethers"

const ARGENT_TOKEN_CONTRACT =
  "0x4e3920043b272975b32dfc0121817d6e6a943dc266d7ead1e6152e472201f97"

const AccountContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`

const TokenList: FC<{
  walletAddress: string
  onAction?: (token: string, action: TokenAction) => Promise<void> | void
}> = ({ walletAddress, onAction }) => {
  const tokens = useMitt(
    tokensMitt,
    "UPDATE",
    () => getTokens(walletAddress),
    true,
  )

  const tokenDetails: TokenDetails[] = usePromise(
    async (tokens: string[], walletAddress: string) => {
      return Promise.all(
        tokens.map((address) => {
          return fetchTokenDetails(address, walletAddress)
        }),
      )
    },
    [tokens, walletAddress],
    Infinity,
  )

  return (
    <>
      {tokenDetails.map((token, i) => (
        <TokenListItem
          key={i}
          index={i}
          decimals={token.decimals!.toNumber()}
          balance={
            ethers.utils.formatUnits(token.balance!, token.decimals!) || "0"
          }
          name={token.name || ""}
          symbol={token.symbol || ""}
          onAction={(action) => onAction?.(token.address, action)}
          mintable={token.address === ARGENT_TOKEN_CONTRACT}
        />
      ))}
    </>
  )
}

const Spinner = styled.img`
  max-width: 92px;
  max-height: 92px;
  margin: auto;
`

export const Account: FC<{
  wallet: Wallet
  accountNumber: number
  onShowAccountList?: () => void
  onAddToken?: () => void
  onAction?: (token: string, action: TokenAction) => Promise<void> | void
}> = ({ wallet, accountNumber, onShowAccountList, onAddToken, onAction }) => {
  const { code, text } = useStatus(wallet)

  return (
    <AccountColumn>
      <AccountHeader>
        <ProfilePicture
          {...makeClickable(onShowAccountList)}
          src={getProfileImageUrl(accountNumber)}
        />
        <AccountRow>
          <AccountColumn>
            <AccountName>{getProfileName(accountNumber)}</AccountName>
            <AccountAddressWrapper>
              <CopyToClipboard text={wallet.address}>
                <AccountAddress>{wallet.address}</AccountAddress>
              </CopyToClipboard>
              <AccountAddressIconsWrapper>
                <CopyToClipboard text={wallet.address}>
                  <Copy style={{ cursor: "pointer" }} />
                </CopyToClipboard>
                <Qr />
              </AccountAddressIconsWrapper>
            </AccountAddressWrapper>
          </AccountColumn>
          <AccountColumn>
            <AccountNetwork>Goerli alpha</AccountNetwork>
            <AccountStatusWrapper>
              <AccountStatusText>{text}</AccountStatusText>
              <AccountStatusIndicator status={code} />
            </AccountStatusWrapper>
          </AccountColumn>
        </AccountRow>
      </AccountHeader>
      <AccountContent>
        <Suspense fallback={<Spinner src={LoadingGif} alt="Loading..." />}>
          <TokenList onAction={onAction} walletAddress={wallet.address} />
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
