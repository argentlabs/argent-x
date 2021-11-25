import Tippy from "@tippyjs/react"
import { ethers } from "ethers"
import { FC, Suspense } from "react"
import usePromise from "react-promise-suspense"
import styled from "styled-components"

import Add from "../../assets/add.svg"
import Copy from "../../assets/copy.svg"
import Open from "../../assets/open.svg"
import {
  AccountAddressIconsWrapper,
  AccountAddressLink,
  AccountAddressWrapper,
} from "../components/Account/Address"
import { EmptyWalletAlert } from "../components/Account/EmptyWalletAlert"
import { AccountColumn, AccountHeader } from "../components/Account/Header"
import {
  AccountNetwork,
  AccountStatusIndicator,
} from "../components/Account/Network"
import { ProfilePicture } from "../components/Account/ProfilePicture"
import { CopyTooltip, Tooltip } from "../components/CopyTooltip"
import { Spinner } from "../components/Spinner"
import {
  AddTokenIconButton,
  TokenAction,
  TokenListItem,
  TokenTitle,
  TokenWrapper,
} from "../components/Token"
import { H1 } from "../components/Typography"
import { useMitt } from "../hooks/useMitt"
import { useStatus } from "../hooks/useStatus"
import { makeClickable } from "../utils/a11y"
import { truncateAddress } from "../utils/addresses"
import {
  TokenDetails,
  fetchTokenDetails,
  getTokens,
  tokensMitt,
} from "../utils/tokens"
import { getAccountImageUrl, getAccountName } from "../utils/wallet"
import { Wallet } from "../Wallet"

const AccountContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`

const AccountRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

const AccountStatusText = styled.p`
  font-size: 12px;
  font-weight: 600;
  line-height: 12px;
  text-align: center;
  margin-top: 6px;
`

const AccountName = styled(H1)`
  font-weight: 600;
  font-size: 32px;
  line-height: 38.4px;
  margin: 0;
`

const TokenList: FC<{
  walletAddress: string
  onShowToken: (token: TokenDetails) => void
  onAction?: (token: string, action: TokenAction) => Promise<void> | void
}> = ({ walletAddress, onShowToken, onAction }) => {
  const tokens = useMitt(
    tokensMitt,
    "UPDATE",
    () => getTokens(walletAddress),
    true,
  )

  const tokenDetails: TokenDetails[] = usePromise(
    async (tokens: string[], walletAddress: string) =>
      Promise.all(
        tokens.map((address) => fetchTokenDetails(address, walletAddress)),
      ),
    [tokens, walletAddress],
    Infinity,
  )

  const hasBalance = tokenDetails.some(
    ({ balance }) => balance && !balance.isZero(),
  )

  return (
    <>
      {!hasBalance && (
        <EmptyWalletAlert walletAddress={walletAddress} onAction={onAction} />
      )}
      {tokenDetails.map((token, i) => (
        <TokenListItem
          key={token.address}
          index={i}
          decimals={token.decimals?.toNumber()}
          balance={
            ethers.utils.formatUnits(token.balance ?? 0, token.decimals) || "0"
          }
          name={token.name || ""}
          symbol={token.symbol || ""}
          onClick={() => onShowToken(token)}
        />
      ))}
    </>
  )
}

export const Account: FC<{
  wallet: Wallet
  accountNumber: number
  onShowAccountList?: () => void
  onShowToken: (token: TokenDetails) => void
  onAddToken?: () => void
  onAction?: (token: string, action: TokenAction) => Promise<void> | void
}> = ({
  wallet,
  accountNumber,
  onShowAccountList,
  onShowToken,
  onAddToken,
  onAction,
}) => {
  const { code, text } = useStatus(wallet)

  return (
    <AccountColumn>
      <AccountHeader>
        <ProfilePicture
          {...makeClickable(onShowAccountList)}
          src={getAccountImageUrl(accountNumber)}
        />
        <AccountRow>
          <Tippy content={<Tooltip>{text}</Tooltip>}>
            <AccountNetwork title={text}>
              <span>Goerli alpha</span>
              <AccountStatusIndicator status={code} />
            </AccountNetwork>
          </Tippy>
        </AccountRow>
      </AccountHeader>
      <AccountContent>
        <div>
          <AccountName>{getAccountName(accountNumber)}</AccountName>
          {code !== "CONNECTED" && code !== "DEFAULT" && (
            <AccountStatusText>{text}</AccountStatusText>
          )}
        </div>
        <AccountAddressWrapper>
          <AccountAddressLink
            href={`https://voyager.online/contract/${wallet.address}`}
            target="_blank"
          >
            starknet: {truncateAddress(wallet.address)}
            <Open style={{ marginLeft: 7 }} />
          </AccountAddressLink>
          <CopyTooltip
            copyValue={`starknet:${wallet.address}`}
            message="Copied!"
          >
            <AccountAddressIconsWrapper>
              <Copy />
            </AccountAddressIconsWrapper>
          </CopyTooltip>
        </AccountAddressWrapper>

        <Suspense fallback={<Spinner size={64} />}>
          <TokenList
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
