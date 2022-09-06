import { FC } from "react"
import styled from "styled-components"

import { TransactionArgentX } from "../../../components/Icons/TransactionArgentX"
import { TransactionNFT } from "../../../components/Icons/TransactionNFT"
import { TransactionReceive } from "../../../components/Icons/TransactionReceive"
import { TransactionSend } from "../../../components/Icons/TransactionSend"
import { TransactionSwap } from "../../../components/Icons/TransactionSwap"
import { TransactionUnknown } from "../../../components/Icons/TransactionUnknown"
import { getTokenIconUrl } from "../../accountTokens/TokenIcon"
import { DappIcon } from "../../actions/connectDapp/DappIcon"
import {
  isSwapTransaction,
  isTokenMintTransaction,
  isTokenTransferTransaction,
} from "../transform/is"
import { TransformedTransaction } from "../transform/type"

const Container = styled.div<{
  size: number
  outline?: boolean
}>`
  font-size: ${({ size }) => size}px;
  width: 1em;
  height: 1em;
  border-radius: 500px;
  background-color: ${({ theme }) => theme.black};
  position: relative;
  ${({ outline }) => (outline ? `border: 1px solid white;` : "")}
`

const TokenImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 500px; ;
`

const BadgeContainer = styled.div<{
  size: number
}>`
  position: absolute;
  right: 0;
  bottom: 0;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
`

export interface ITransactionIcon {
  transaction: TransformedTransaction
  size: number
  outline?: boolean
}

export const TransactionIcon: FC<ITransactionIcon> = ({
  transaction,
  size = 80,
  outline = false,
}) => {
  const badgeSize = Math.min(24, Math.round((size * 16) / 40))
  const { action, entity, dapp } = transaction
  let iconComponent = <TransactionUnknown />
  let badgeComponent
  switch (entity) {
    case "ACCOUNT":
      iconComponent = <TransactionArgentX />
      break
    case "NFT":
      iconComponent = <TransactionArgentX />
      break
  }
  switch (action) {
    case "SEND":
      iconComponent = <TransactionSend />
      break
    case "RECEIVE":
      iconComponent = <TransactionReceive />
      break
    case "TRANSFER":
      iconComponent = <TransactionSend />
      break
    case "SWAP":
      iconComponent = <TransactionSwap />
      break
    case "MINT":
    case "BUY":
      iconComponent =
        entity === "TOKEN" ? <TransactionReceive /> : <TransactionNFT />
      break
  }
  if (
    isTokenTransferTransaction(transaction) ||
    isTokenMintTransaction(transaction)
  ) {
    const { token } = transaction
    if (token) {
      const src = getTokenIconUrl({
        url: token.image,
        name: token.name,
      })
      badgeComponent = <TokenImage src={src} />
    }
  } else if (isSwapTransaction(transaction)) {
    const { toToken } = transaction
    if (toToken) {
      const src = getTokenIconUrl({
        url: toToken.image,
        name: toToken.name,
      })
      badgeComponent = <TokenImage src={src} />
    }
  }
  if (dapp && !badgeComponent) {
    badgeComponent = <DappIcon host={dapp.hosts[0]} />
  }
  return (
    <Container size={size} outline={outline}>
      {iconComponent}
      <BadgeContainer size={badgeSize}>{badgeComponent}</BadgeContainer>
    </Container>
  )
}
