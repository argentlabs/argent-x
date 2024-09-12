import { FC, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useLiveAccountGuardianState } from "../../../../smartAccount/usePendingChangingGuardian"
import { ChangeGuardian } from "../../../../../../shared/smartAccount/changeGuardianCallDataToType"
import { useSmartAccountEnabled } from "../../../../../../shared/smartAccount/useSmartAccountEnabled"
import { useToggleSmartAccountRoute } from "../../../../smartAccount/useToggleSmartAccountRoute"
import { ButtonCell, P4, iconsDeprecated } from "@argent/x-ui"
import { routes } from "../../../../../../shared/ui/routes"
import { WalletAccount } from "../../../../../../shared/wallet.model"

const { SmartAccountActiveIcon, WalletIcon } = iconsDeprecated

export const SmartAccountToggleButtonContainer: FC<{
  account: WalletAccount
}> = ({ account }) => {
  const navigate = useNavigate()

  const liveAccountGuardianState = useLiveAccountGuardianState(account)
  const isSmartAccountEnabled = useSmartAccountEnabled()

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
    <WalletIcon fontSize={"xl"} opacity={!smartAccountIsLoading ? 1 : 0.6} />
  ) : (
    <SmartAccountActiveIcon
      fontSize={"xl"}
      opacity={!smartAccountIsLoading ? 1 : 0.6}
    />
  )

  const buttonText = hasGuardian
    ? "Change to Standard Account"
    : "Upgrade to Smart Account"

  const onStartSmartAccountFlow = async () => {
    if (!hasGuardian) {
      navigate(routes.smartAccountStart(account.address))
    } else {
      await startToggleSmartAccountFlow(account)
    }
  }

  return (
    isSmartAccountEnabled && (
      <SmartAccountToggleButton
        buttonText={buttonText}
        accountSubtitle={accountSubtitle}
        leftIcon={leftIcon}
        onClick={onStartSmartAccountFlow}
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
      <P4 color="neutrals.300" fontWeight={"normal"}>
        {accountSubtitle}
      </P4>
    </ButtonCell>
  )
}
