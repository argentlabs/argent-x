import { FC, ReactNode, useMemo } from "react"
import styled, { css } from "styled-components"

import { Network } from "../../../shared/network"
import { makeClickable } from "../../services/a11y"
import { PrettyAccountAddress } from "../accounts/PrettyAccountAddress"
import {
  TokenDetailsWrapper,
  TokenTextGroup,
  TokenTitle,
  TokenWrapper,
} from "../accountTokens/TokenListItemDeprecated"
import {
  isDeclareContractTransaction,
  isDeployContractTransaction,
  isNFTTransaction,
  isNFTTransferTransaction,
  isSwapTransaction,
  isTokenApproveTransaction,
  isTokenMintTransaction,
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

export interface ITransactionListItem {
  transactionTransformed: TransformedTransaction
  network: Network
  highlighted?: boolean
  onClick?: () => void
  children?: ReactNode | ReactNode[]
}

export const TransactionListItem: FC<ITransactionListItem> = ({
  transactionTransformed,
  network,
  highlighted,
  onClick,
  children,
  ...props
}) => {
  const { action, displayName, dapp } = transactionTransformed
  console.log(transactionTransformed)
  const isNFT = isNFTTransaction(transactionTransformed)
  const isNFTTransfer = isNFTTransferTransaction(transactionTransformed)
  const isTransfer = isTokenTransferTransaction(transactionTransformed)
  const isSwap = isSwapTransaction(transactionTransformed)
  const isTokenMint = isTokenMintTransaction(transactionTransformed)
  const isTokenApprove = isTokenApproveTransaction(transactionTransformed)
  const isDeclareContract = isDeclareContractTransaction(transactionTransformed)
  const isDeployContract = isDeployContractTransaction(transactionTransformed)

  const subtitle = useMemo(() => {
    if (isTransfer || isNFTTransfer) {
      const titleShowsTo =
        (isTransfer || isNFTTransfer) &&
        (action === "SEND" || action === "TRANSFER")
      const { toAddress, fromAddress } = transactionTransformed
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
    if (isDeclareContract) {
      return <>{transactionTransformed.classHash}</>
    }
    if (isDeployContract) {
      return <>{transactionTransformed.contractAddress}</>
    }
    return null
  }, [
    isTransfer,
    dapp,
    isNFTTransfer,
    isDeclareContract,
    isDeployContract,
    action,
    transactionTransformed,
    network.id,
  ])

  const accessory = useMemo(() => {
    if (isNFT) {
      return (
        <NFTAccessory
          transaction={transactionTransformed}
          networkId={network.id}
        />
      )
    }
    if (isTransfer || isTokenMint || isTokenApprove) {
      return <TransferAccessory transaction={transactionTransformed} />
    }
    if (isSwap) {
      return <SwapAccessory transaction={transactionTransformed} />
    }
    return null
  }, [
    isNFT,
    isTransfer,
    isTokenMint,
    isTokenApprove,
    isSwap,
    transactionTransformed,
    network.id,
  ])

  return (
    <Container {...makeClickable(onClick)} highlighted={highlighted} {...props}>
      <TransactionIcon transaction={transactionTransformed} size={40} />
      <TokenDetailsWrapper>
        <TokenTextGroup>
          <TokenTitle>{displayName}</TokenTitle>
          <TransactionSubtitle>{subtitle}</TransactionSubtitle>
        </TokenTextGroup>
      </TokenDetailsWrapper>
      {accessory}
      {children}
    </Container>
  )
}
