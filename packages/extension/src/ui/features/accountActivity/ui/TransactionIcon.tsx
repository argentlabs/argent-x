import { getTokenIconUrl, iconsDeprecated } from "@argent/x-ui"
import { Circle, Image, SquareProps } from "@chakra-ui/react"
import { FC } from "react"

import { ActivityTransactionFailureReason } from "../../../../shared/activity/utils/transform/getTransactionFailureReason"
import {
  isSwapTransaction,
  isTokenApproveTransaction,
  isTokenMintTransaction,
  isTokenTransferTransaction,
} from "../../../../shared/activity/utils/transform/is"
import { TransformedTransaction } from "../../../../shared/activity/utils/transform/type"
import { DappIconContainer } from "../../actions/connectDapp/DappIconContainer"

const {
  DocumentIcon,
  SendIcon,
  ReceiveIcon,
  DeployIcon,
  ApproveIcon,
  NftIcon,
  SwapIcon,
  ActivityIcon,
  SmartAccountActiveIcon,
  SmartAccountInactiveIcon,
  MultisigJoinIcon,
  MultisigRemoveIcon,
  MultisigReplaceIcon,
  FailIcon,
  CloseIcon,
} = iconsDeprecated

export interface TransactionIconContainerProps
  extends Omit<SquareProps, "outline"> {
  transaction: TransformedTransaction
  outline?: boolean
  failureReason?: ActivityTransactionFailureReason
  size?: number
}

export const TransactionIconContainer: FC<TransactionIconContainerProps> = ({
  transaction,
  size = 18,
  outline = false,
  failureReason,
  ...rest
}) => {
  const { action, entity, dapp } = transaction
  let iconComponent = <ActivityIcon />
  let badgeComponent
  switch (entity) {
    case "ACCOUNT":
      iconComponent = <DeployIcon />
      break
    case "GUARDIAN":
      iconComponent =
        action === "ADD" ? (
          <SmartAccountActiveIcon />
        ) : (
          <SmartAccountInactiveIcon />
        )
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
    case "REJECT_ON_CHAIN":
      iconComponent = <CloseIcon />
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
    <TransactionIcon
      iconComponent={failureReason ? <FailIcon /> : iconComponent}
      badgeComponent={badgeComponent}
      size={size}
      outline={outline}
      {...rest}
    />
  )
}

export interface TransactionIconProps extends Omit<SquareProps, "outline"> {
  iconComponent?: JSX.Element
  badgeComponent?: JSX.Element
  outline?: boolean
  size?: number
}

export const TransactionIcon: FC<TransactionIconProps> = ({
  iconComponent,
  badgeComponent,
  outline,
  size = 18,
  ...rest
}: TransactionIconProps) => {
  const badgeSize = Math.min(32, Math.round((size * 16) / 36))
  const iconSize = Math.round((4 * (size * 16)) / 36)

  return (
    <Circle
      size={size}
      border={outline ? `1px solid white` : undefined}
      bg={"neutrals.600"}
      fontSize={iconSize}
      position={"relative"}
      {...rest}
    >
      {iconComponent}
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
