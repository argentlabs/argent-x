import { icons } from "@argent/ui"
import { Circle, Image } from "@chakra-ui/react"
import { ComponentProps, FC } from "react"

import { getTokenIconUrl } from "../../accountTokens/TokenIcon"
import { DappIcon } from "../../actions/connectDapp/DappIcon"
import {
  isSwapTransaction,
  isTokenApproveTransaction,
  isTokenMintTransaction,
  isTokenTransferTransaction,
} from "../transform/is"
import { TransformedTransaction } from "../transform/type"

const {
  SendIcon,
  ReceiveIcon,
  DeployIcon,
  ApproveIcon,
  NftIcon,
  SwapIcon,
  ActivityIcon,
} = icons

export interface TransactionIconProps
  extends Omit<ComponentProps<typeof Circle>, "outline"> {
  transaction: TransformedTransaction
  outline?: boolean
}

export const TransactionIcon: FC<TransactionIconProps> = ({
  transaction,
  size = 18,
  outline = false,
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
  if (
    isTokenTransferTransaction(transaction) ||
    isTokenMintTransaction(transaction) ||
    isTokenApproveTransaction(transaction)
  ) {
    const { token } = transaction
    if (token) {
      const src = getTokenIconUrl({
        url: token.image,
        name: token.name,
      })
      badgeComponent = <Image src={src} />
    }
  } else if (isSwapTransaction(transaction)) {
    const { toToken } = transaction
    if (toToken) {
      const src = getTokenIconUrl({
        url: toToken.image,
        name: toToken.name,
      })
      badgeComponent = <Image src={src} />
    }
  }
  if (dapp && !badgeComponent) {
    badgeComponent = <DappIcon host={dapp.hosts[0]} />
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
