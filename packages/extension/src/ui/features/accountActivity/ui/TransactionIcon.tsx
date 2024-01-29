import { icons } from "@argent/ui"
import { Circle, Image, SquareProps } from "@chakra-ui/react"
import { FC } from "react"

import { getTokenIconUrl } from "../../accountTokens/TokenIcon"
import {
  isSwapTransaction,
  isTokenApproveTransaction,
  isTokenMintTransaction,
  isTokenTransferTransaction,
} from "../transform/is"
import { TransformedTransaction } from "../transform/type"
import { DappIconContainer } from "../../actions/connectDapp/DappIconContainer"
import { ActivityTransactionFailureReason } from "../getTransactionFailureReason"

const {
  DocumentIcon,
  SendIcon,
  ReceiveIcon,
  DeployIcon,
  ApproveIcon,
  NftIcon,
  SwapIcon,
  ActivityIcon,
  ArgentShieldIcon,
  ArgentShieldDeactivateIcon,
  MultisigJoinIcon,
  MultisigRemoveIcon,
  MultisigReplaceIcon,
  FailIcon,
} = icons

export interface TransactionIconProps extends Omit<SquareProps, "outline"> {
  transaction: TransformedTransaction
  outline?: boolean
  failureReason?: ActivityTransactionFailureReason
  size?: number
}

export const TransactionIcon: FC<TransactionIconProps> = ({
  transaction,
  size = 18,
  outline = false,
  failureReason,
  ...rest
}) => {
  const badgeSize = Math.min(32, Math.round((size * 16) / 36))
  const iconSize = Math.round((4 * (size * 16)) / 36)
  const { action, entity, dapp } = transaction
  let iconComponent = <ActivityIcon />
  let badgeComponent
  switch (entity) {
    case "ACCOUNT":
      iconComponent = <DeployIcon />
      break
    case "GUARDIAN":
      iconComponent =
        action === "ADD" ? <ArgentShieldIcon /> : <ArgentShieldDeactivateIcon />
      break
    case "SIGNER":
      iconComponent =
        action === "ADD" ? (
          <MultisigJoinIcon />
        ) : action === "REMOVE" ? (
          <MultisigRemoveIcon />
        ) : (
          <MultisigReplaceIcon />
        )
      break
    case "THRESHOLD":
      iconComponent = <ApproveIcon />
      break
  }
  switch (action) {
    case "SEND":
      iconComponent = <SendIcon />
      break
    case "RECEIVE":
      iconComponent = <ReceiveIcon />
      break
    case "TRANSFER":
      iconComponent = <SendIcon />
      break
    case "SWAP":
      iconComponent = <SwapIcon />
      break
    case "MINT":
    case "BUY":
      iconComponent = entity === "TOKEN" ? <ReceiveIcon /> : <NftIcon />
      break
    case "APPROVE":
      iconComponent = <ApproveIcon />
      break
  }

  if (entity === "CONTRACT" && (action === "DEPLOY" || action === "DECLARE")) {
    iconComponent = <DocumentIcon />
  }

  if (
    isTokenTransferTransaction(transaction) ||
    isTokenMintTransaction(transaction) ||
    isTokenApproveTransaction(transaction)
  ) {
    const { token } = transaction
    if (token) {
      const src = getTokenIconUrl({
        url: token.iconUrl,
        name: token.name,
      })
      badgeComponent = <Image src={src} />
    }
  } else if (isSwapTransaction(transaction)) {
    const { toToken } = transaction
    if (toToken) {
      const src = getTokenIconUrl({
        url: toToken.iconUrl,
        name: toToken.name,
      })
      badgeComponent = <Image src={src} />
    }
  }
  if (dapp && !badgeComponent) {
    badgeComponent = <DappIconContainer host={dapp.hosts[0]} />
  }
  return (
    <Circle
      size={size}
      border={outline ? `1px solid white` : undefined}
      position={"relative"}
      bg={"neutrals.600"}
      fontSize={iconSize}
      {...rest}
    >
      {failureReason ? <FailIcon /> : iconComponent}
      {badgeComponent && (
        <Circle
          overflow={"hidden"}
          position={"absolute"}
          right={0}
          bottom={0}
          size={badgeSize}
        >
          {badgeComponent}
        </Circle>
      )}
    </Circle>
  )
}
