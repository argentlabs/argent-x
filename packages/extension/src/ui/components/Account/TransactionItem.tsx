import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { FC } from "react"
import styled, { css, keyframes } from "styled-components"

import { TransactionMeta } from "../../../shared/transactions.model"
import { makeClickable } from "../../utils/a11y"
import { AccountStatusCode } from "../../utils/accounts"
import { truncateAddress } from "../../utils/addresses"
import { NetworkStatusIndicator } from "../NetworkSwitcher"
import {
  TokenDetailsWrapper,
  TokenSubtitle,
  TokenTextGroup,
  TokenTitle,
  TokenWrapper,
} from "../Token"
import { TokenIcon } from "../TokenIcon"

export const TransactionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const TransactionWrapper = styled(TokenWrapper)<{ highlighted?: boolean }>`
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

const PulseAnimation = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 168, 92, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(255, 168, 92, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 168, 92, 0);
  }
`

export const TransactionIndicator = styled(NetworkStatusIndicator)`
  margin-right: 8px;

  ${({ status = "CONNECTED" }) =>
    status === "DEPLOYING" &&
    css`
      box-shadow: 0 0 0 0 rgba(255, 168, 92, 1);
      transform: scale(1);
      animation: ${PulseAnimation} 1.5s infinite;
    `}
`

const TransactionSubtitle = styled(TokenSubtitle)``

interface TransactionItemProps {
  hash: string
  status?: AccountStatusCode
  highlighted?: boolean
  meta?: TransactionMeta
  onClick?: () => void
}

export const TransactionItem: FC<TransactionItemProps> = ({
  hash,
  status = "DEFAULT",
  highlighted,
  meta,
  onClick,
  ...props
}) => {
  return (
    <TransactionWrapper
      {...makeClickable(onClick)}
      highlighted={highlighted}
      {...props}
    >
      <TokenIcon name={meta?.title || hash.substring(2)} />
      <TokenDetailsWrapper>
        <TokenTextGroup>
          <TokenTitle>
            {meta?.title || truncateAddress(hash)}
            <OpenInNewIcon style={{ fontSize: "0.8rem", marginLeft: 5 }} />
          </TokenTitle>
          <TransactionSubtitle>
            {meta?.subTitle || truncateAddress(hash)}
          </TransactionSubtitle>
        </TokenTextGroup>
        <TransactionIndicator status={status} />
      </TokenDetailsWrapper>
    </TransactionWrapper>
  )
}
