import type { FC } from "react"
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useLiveAccountGuardianState } from "../../../../smartAccount/usePendingChangingGuardian"
import { ChangeGuardian } from "../../../../../../shared/smartAccount/changeGuardianCallDataToType"
import { useSmartAccountEnabled } from "../../../../../../shared/smartAccount/useSmartAccountEnabled"
import { useToggleSmartAccountRoute } from "../../../../smartAccount/useToggleSmartAccountRoute"
import { WalletSecondaryIcon, ShieldSecondaryIcon } from "@argent/x-ui/icons"
import { ButtonCell, P3 } from "@argent/x-ui"
import { routes } from "../../../../../../shared/ui/routes"
import type { WalletAccount } from "../../../../../../shared/wallet.model"

export const SmartAccountToggleButtonContainer: FC<{
  account: WalletAccount
}> = ({ account }) => {
  const navigate = useNavigate()

  const liveAccountGuardianState = useLiveAccountGuardianState(account)
  const isSmartAccountEnabled = useSmartAccountEnabled(account.networkId)

  const { startToggleSmartAccountFlow } = useToggleSmartAccountRoute()

  const { status, type, hasGuardian } = liveAccountGuardianState
  const isAdding = type === ChangeGuardian.ADDING

  const accountSubtitle = useMemo(() => {
    if (status === "ERROR") {
      return isAdding
        ? "Upgrading to Smart Account Failed"
        : "Changing to Standard Account Failed"
    }
    if (status === "PENDING") {
      return isAdding
        ? "Upgrading to Smart Account…"
        : "Changing to Standard Account…"
    }
    return
  }, [isAdding, status])

  const smartAccountIsLoading = liveAccountGuardianState.status === "PENDING"

  const leftIcon = hasGuardian ? (
    <WalletSecondaryIcon
      fontSize={"xl"}
      opacity={!smartAccountIsLoading ? 1 : 0.6}
    />
  ) : (
    <ShieldSecondaryIcon
      fontSize={"xl"}
      opacity={!smartAccountIsLoading ? 1 : 0.6}
    />
  )

  const buttonText = hasGuardian
    ? "Change to Standard Account"
    : "Upgrade to Smart Account"

  const onStartSmartAccountFlow = async () => {
    if (!hasGuardian) {
      void navigate(routes.smartAccountStart(account.id))
    } else {
      await startToggleSmartAccountFlow(account)
    }
  }

  const shouldRenderButton = useMemo(() => {
    return (
      isSmartAccountEnabled &&
      (account.type === "standard" || account.type === "smart")
    )
  }, [isSmartAccountEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    shouldRenderButton && (
      <SmartAccountToggleButton
        buttonText={buttonText}
        accountSubtitle={accountSubtitle}
        leftIcon={leftIcon}
        onClick={() => void onStartSmartAccountFlow()}
      />
    )
  )
}

interface SmartAccountToggleButtonProps {
  buttonText: string
  accountSubtitle: string | undefined
  leftIcon: JSX.Element
  onClick: () => void
}

export const SmartAccountToggleButton: FC<SmartAccountToggleButtonProps> = ({
  buttonText,
  accountSubtitle,
  leftIcon,
  onClick,
}) => {
  return (
    <ButtonCell
      onClick={onClick}
      leftIcon={leftIcon}
      data-testid="smart-account-button"
    >
      {buttonText}
      <P3 color="neutrals.300" fontWeight={"normal"}>
        {accountSubtitle}
      </P3>
    </ButtonCell>
  )
}
