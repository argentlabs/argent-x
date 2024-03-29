import { FlexProps } from "@chakra-ui/react"
import { ReactNode } from "react"

import { ArgentAccountType } from "../../../shared/wallet.model"
import { CustomButtonCellProps } from "../../components/CustomButtonCell"

export interface AccountListItemProps extends CustomButtonCellProps {
  accountName: string
  accountDescription?: string
  accountAddress: string
  networkId: string
  networkName?: string
  accountType?: ArgentAccountType
  deploying?: boolean
  upgrade?: boolean
  connectedHost?: string
  hidden?: boolean
  avatarIcon?: ReactNode
  avatarOutlined?: boolean
  avatarSize?: number
  isShield?: boolean
  isOwner?: boolean
  isClickable?: boolean
  isDeprecated?: boolean
  displayArgentShieldBanner?: boolean
  rightElementFlexProps?: FlexProps
  connectedTooltipLabel?: string
  prettyAccountBalance?: string
  accountExtraInfo?: string
  showRightElements?: boolean
}
