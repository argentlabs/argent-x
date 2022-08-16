import { FC, useMemo } from "react"
import styled, { css } from "styled-components"

import { IExplorerTransaction } from "../../../shared/explorer/type"
import { Network } from "../../../shared/network"
import { makeClickable } from "../../services/a11y"
import { PrettyAccountAddress } from "../accounts/PrettyAccountAddress"
import {
  TokenDetailsWrapper,
  TokenTextGroup,
  TokenTitle,
  TokenWrapper,
} from "../accountTokens/TokenListItem"
import {
  isNFTTransaction,
  isSwapTransaction,
  isTokenTransferTransaction,
} from "./transform/is"
import { TransformedTransaction } from "./transform/type"
import { NFTAccessory } from "./ui/NFTAccessory"
import { SwapAccessory } from "./ui/SwapAccessory"
import { TransactionIcon } from "./ui/TransactionIcon"
import { TransferAccessory } from "./ui/TransferAccessory"

export const TransactionsListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const Container = styled(TokenWrapper)<{
  highlighted?: boolean
}>`
  cursor: pointer;

  ${({ highlighted }) =>
    highlighted &&
    css`
      background-color: rgba(255, 255, 255, 0.1);
    `}

  &:hover, &:focus {
    background-color: rgba(255, 255, 255, 0.15);
  }
`

const TransactionSubtitle = styled.div`
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.text2};
  margin: 0;
`

const TitleAddressContainer = styled.div`
  display: flex;
  align-items: center;
`

const TitleAddressPrefix = styled.div`
  margin-right: 8px;
`

const TitleAddress = styled.div``

export interface IExplorerTransactionListItem {
  explorerTransaction: IExplorerTransaction
  explorerTransactionTransformed: TransformedTransaction
  network: Network
  highlighted?: boolean
  onClick?: () => void
}

export const ExplorerTransactionListItem: FC<IExplorerTransactionListItem> = ({
  explorerTransaction,
  explorerTransactionTransformed,
  network,
  highlighted,
  onClick,
  ...props
}) => {
  const { action, displayName, dapp } = explorerTransactionTransformed
  const isNFT = isNFTTransaction(explorerTransactionTransformed)
  const isTransfer = isTokenTransferTransaction(explorerTransactionTransformed)
  const isSwap = isSwapTransaction(explorerTransactionTransformed)

  const subtitle = useMemo(() => {
    if (isTransfer) {
      const titleShowsTo =
        isTransfer && (action === "SEND" || action === "TRANSFER")
      const { toAddress, fromAddress } = explorerTransactionTransformed
      return (
        <TitleAddressContainer>
          <TitleAddressPrefix>
            {titleShowsTo ? "To:" : "From:"}
          </TitleAddressPrefix>
          <TitleAddress>
            <PrettyAccountAddress
              accountAddress={titleShowsTo ? toAddress : fromAddress}
              networkId={network.id}
              size={15}
            />
          </TitleAddress>
        </TitleAddressContainer>
      )
    }
    if (dapp) {
      return <>{dapp.title}</>
    }
    return null
  }, [action, dapp, explorerTransactionTransformed, isTransfer, network.id])

  const accessory = useMemo(() => {
    if (isNFT) {
      return (
        <NFTAccessory
          transaction={explorerTransactionTransformed}
          networkId={network.id}
        />
      )
    }
    if (isTransfer) {
      return <TransferAccessory transaction={explorerTransactionTransformed} />
    }
    if (isSwap) {
      return <SwapAccessory transaction={explorerTransactionTransformed} />
    }
    return null
  }, [explorerTransactionTransformed, isNFT, isSwap, isTransfer, network.id])

  return (
    <Container {...makeClickable(onClick)} highlighted={highlighted} {...props}>
      <TransactionIcon transaction={explorerTransactionTransformed} size={40} />
      <TokenDetailsWrapper>
        <TokenTextGroup>
          <TokenTitle>{displayName}</TokenTitle>
          <TransactionSubtitle>{subtitle}</TransactionSubtitle>
        </TokenTextGroup>
      </TokenDetailsWrapper>
      {accessory}
    </Container>
  )
}
