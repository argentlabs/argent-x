import { FC } from "react"
import styled, { css, keyframes } from "styled-components"

import { TransactionMeta as ITransactionMeta } from "../../../shared/transactions.model"
// import { makeClickable } from "../../utils/a11y"
import { truncateAddress } from "../../utils/addresses"
import { CopyTooltip } from "../CopyTooltip"
import { NetworkStatusIndicator } from "../NetworkSwitcher"
import {
  TokenDetailsWrapper,
  TokenMeta,
  TokenTextGroup,
  TokenTitle,
  TokenWrapper,
} from "../Token"
import { TokenIcon } from "../TokenIcon"

export const TransactionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #333332;
  border-radius: 8px;
  padding: 16px;
`

const TransactionWrapper = styled(TokenWrapper)`
  background-color: #333332;
  cursor: auto;

  &:hover,
  &:focus {
    background-color: #333332;
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

const TransactionMeta = styled(TokenMeta)`
  cursor: pointer;
`

interface TransactionProps {
  txHash: string
  meta?: ITransactionMeta
  onClick?: () => void
}

export const TransactionItem: FC<TransactionProps> = ({
  txHash,
  meta,
  onClick,
  ...props
}) => {
  return (
    <TransactionWrapper
      // {...makeClickable(onClick)} // TODO: can be reenabled once voyager supports pending transactions
      {...props}
    >
      <TokenIcon name={meta?.title || txHash.substring(2)} />
      <TokenDetailsWrapper>
        <TokenTextGroup>
          <TokenTitle>{meta?.title || truncateAddress(txHash)}</TokenTitle>
          <CopyTooltip copyValue={txHash} message="Transaction hash copied!">
            <TransactionMeta>{truncateAddress(txHash)}</TransactionMeta>
          </CopyTooltip>
        </TokenTextGroup>
        <TransactionIndicator status={"DEPLOYING"} />
      </TokenDetailsWrapper>
    </TransactionWrapper>
  )
}
