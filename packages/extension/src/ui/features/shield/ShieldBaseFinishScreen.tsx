import {
  Button,
  CellStack,
  FlowHeader,
  FlowHeaderProps,
  icons,
} from "@argent/ui"
import { Center } from "@chakra-ui/react"
import { FC, useCallback } from "react"
import { To, useNavigate } from "react-router-dom"

import {
  ChangeGuardian,
  LiveAccountGuardianState,
} from "./usePendingChangingGuardian"
import { useShieldOnboardingTracking } from "./useShieldTracking"

const { ArgentShieldIcon, ArgentShieldDeactivateIcon, TickIcon, AlertIcon } =
  icons

export interface GetFlowHeaderProps {
  accountName?: string
  liveAccountGuardianState?: LiveAccountGuardianState
}

const getFlowHeaderProps = ({
  liveAccountGuardianState,
  accountName,
}: GetFlowHeaderProps): FlowHeaderProps => {
  if (!liveAccountGuardianState) {
    return {
      title: "Argent Shield",
    }
  }
  const { status, type } = liveAccountGuardianState
  const isAdding = type === ChangeGuardian.ADDING
  if (status === "ERROR") {
    return {
      icon: AlertIcon,
      title: isAdding
        ? "Adding Argent Shield Failed"
        : "Removing Argent Shield Failed",
      subtitle: `${accountName} was not modified because the transaction failed. Please try again later`,
      variant: "danger",
    }
  }
  if (status === "PENDING") {
    return {
      icon: isAdding ? ArgentShieldIcon : ArgentShieldDeactivateIcon,
      title: isAdding ? "Adding Argent Shield…" : "Removing Argent Shield…",
      subtitle: isAdding ? (
        <>
          Argent Shield is being added to {accountName}. A{" "}
          <ArgentShieldIcon
            display={"inline"}
            position={"relative"}
            top={"0.125em"}
          />{" "}
          icon will appear next to your account name once it’s added
        </>
      ) : (
        <>
          Argent Shield is being removed from {accountName}. This can take a few
          minutes
        </>
      ),
      isLoading: true,
    }
  }
  if (status === "SUCCESS") {
    return {
      icon: isAdding ? TickIcon : ArgentShieldDeactivateIcon,
      title: isAdding ? "Argent Shield Added" : "Argent Shield Removed",
      subtitle: isAdding
        ? `${accountName} is now protected by Argent Shield two-factor authentication`
        : `${accountName} is not protected by Argent Shield two-factor authentication`,
      variant: isAdding ? "success" : "removed",
    }
  }
  /** 'UNKNOWN' - no transaction */
  return {
    title: "Argent Shield",
  }
}

export interface ShieldBaseFinishScreenProps {
  accountName?: string
  liveAccountGuardianState?: LiveAccountGuardianState
  returnRoute: To
}

export const ShieldBaseFinishScreen: FC<ShieldBaseFinishScreenProps> = ({
  accountName,
  liveAccountGuardianState,
  returnRoute,
}) => {
  const navigate = useNavigate()

  const headerProps = getFlowHeaderProps({
    accountName,
    liveAccountGuardianState,
  })

  const { trackSuccess } = useShieldOnboardingTracking({
    stepId:
      liveAccountGuardianState?.type === ChangeGuardian.ADDING
        ? "addArgentShieldFinish"
        : "removeArgentShieldFinish",
  })

  const onFinish = useCallback(() => {
    void trackSuccess()
    navigate(returnRoute)
  }, [navigate, returnRoute, trackSuccess])
  return (
    <CellStack flex={1}>
      <Center flex={1} flexDirection={"column"}>
        <FlowHeader size={"lg"} {...headerProps} icon={ArgentShieldIcon} />
      </Center>
      <Button onClick={onFinish} colorScheme={"primary"}>
        {headerProps.isLoading ? "Dismiss" : "Done"}
      </Button>
    </CellStack>
  )
}
