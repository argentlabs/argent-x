import type { FlexProps } from "@chakra-ui/react"
import type { ReactNode } from "react"

import type { AccountId, WalletAccountType } from "../../../shared/wallet.model"
import type { CustomButtonCellProps } from "../../components/CustomButtonCell"

export interface AccountListItemProps extends CustomButtonCellProps {
  accountName: string
  accountDescription?: string
  accountId: AccountId
  accountAddress: string
  networkId: string
  networkName?: string
  accountType?: WalletAccountType
  deploying?: boolean
  upgrade?: boolean
  connectedHost?: string
  hidden?: boolean
  avatarIcon?: ReactNode
  avatarOutlined?: boolean
  avatarSize?: number
  isSmartAccount?: boolean
  isOwner?: boolean
  isClickable?: boolean
  isDeprecated?: boolean
  displayArgentSmartAccountBanner?: boolean
  rightElementFlexProps?: FlexProps
  connectedTooltipLabel?: string
  prettyAccountBalance?: ReactNode
  accountExtraInfo?: string
  showRightElements?: boolean
  isLedger?: boolean
}
