import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { FC } from "react"
import styled, { css } from "styled-components"

import { TransactionMeta } from "../../../shared/transactions.model"
import { makeClickable } from "../../utils/a11y"
import { truncateAddress } from "../../utils/addresses"
import {
  StatusIndicatorStatus,
  TransactionStatusIndicator,
} from "../StatusIndicator"
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

const TransactionSubtitle = styled(TokenSubtitle)``

interface TransactionItemProps {
  hash: string
  status?: StatusIndicatorStatus
  highlighted?: boolean
  meta?: TransactionMeta
  onClick?: () => void
}

export const TransactionItem: FC<TransactionItemProps> = ({
  hash,
  status = "transparent",
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
        <TransactionStatusIndicator status={status} />
      </TokenDetailsWrapper>
    </TransactionWrapper>
  )
}
