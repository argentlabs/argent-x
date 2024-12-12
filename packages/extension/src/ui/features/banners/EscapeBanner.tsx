import { icons } from "@argent/x-ui"
import { Spinner } from "@chakra-ui/react"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"

import {
  ESCAPE_SECURITY_PERIOD_DAYS,
  ESCAPE_TYPE_GUARDIAN,
} from "../../../shared/account/details/escape.model"
import { routes } from "../../../shared/ui/routes"
import type { WalletAccount } from "../../../shared/wallet.model"
import { getEscapeDisplayAttributes } from "../smartAccount/escape/getEscapeDisplayAttributes"
import type { LiveAccountEscapeProps } from "../smartAccount/escape/useAccountEscape"
import type { PendingChangeGuardian } from "../smartAccount/usePendingChangingGuardian"
import type { BannerProps } from "./Banner"
import { Banner } from "./Banner"

const {
  WarningCircleSecondaryIcon,
  ShieldSecondaryIcon,
  NoShieldSecondaryIcon,
} = icons

interface EscapeBannerProps extends BannerProps {
  account: WalletAccount
  pending: boolean
  pendingChangeGuardian?: PendingChangeGuardian
  liveAccountEscape?: LiveAccountEscapeProps
  accountGuardianIsSelf: boolean | null
}

export const EscapeBanner: FC<EscapeBannerProps> = ({
  account,
  pending,
  pendingChangeGuardian,
  liveAccountEscape,
  accountGuardianIsSelf,
  ...rest
}) => {
  const navigate = useNavigate()
  if (pending) {
    return (
      <Banner
        colorScheme="warning"
        title={"Pending Escape Transaction"}
        description="This account has a pending escape transaction"
        icon={<Spinner />}
        onClick={() => {
          navigate(routes.smartAccountEscapeWarning(account.id))
        }}
        {...rest}
      />
    )
  }
  if (pendingChangeGuardian) {
    return (
      <Banner
        colorScheme="warning"
        title={"Pending Change Guardian Transaction"}
        description="This account has a pending change guardian transaction"
        icon={<Spinner />}
        onClick={() => {
          navigate(routes.smartAccountEscapeWarning(account.id))
        }}
        {...rest}
      />
    )
  }
  if (liveAccountEscape?.activeFromNowMs === 0 || accountGuardianIsSelf) {
    const step = accountGuardianIsSelf ? 2 : 1
    const title = `(${step}/2) Remove guardian now`
    const description =
      step === 1
        ? `${ESCAPE_SECURITY_PERIOD_DAYS}-day security period is over.`
        : `Second transaction needed for completion`
    return (
      <Banner
        colorScheme="warning"
        title={title}
        description={description}
        icon={<NoShieldSecondaryIcon />}
        onClick={() => {
          navigate(routes.smartAccountEscapeWarning(account.id))
        }}
        {...rest}
      />
    )
  }
  if (!liveAccountEscape) {
    return null
  }
  const { type } = liveAccountEscape
  const { colorScheme, title } = getEscapeDisplayAttributes(liveAccountEscape)
  const icon =
    type === ESCAPE_TYPE_GUARDIAN ? (
      <ShieldSecondaryIcon />
    ) : (
      <WarningCircleSecondaryIcon />
    )

  return (
    <Banner
      colorScheme={colorScheme}
      title={title}
      description="If this was not you, click this banner"
      icon={icon}
      onClick={() => {
        navigate(routes.smartAccountEscapeWarning(account.id))
      }}
      {...rest}
    />
  )
}
