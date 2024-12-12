import type { FlowHeaderProps } from "@argent/x-ui"
import { Button, CellStack, FlowHeader, icons } from "@argent/x-ui"
import { Center } from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback, useEffect, useState } from "react"
import type { To } from "react-router-dom"
import { useNavigate } from "react-router-dom"

import type { LiveAccountGuardianState } from "./usePendingChangingGuardian"
import { ChangeGuardian } from "../../../shared/smartAccount/changeGuardianCallDataToType"

const {
  CheckmarkSecondaryIcon,
  WarningCircleSecondaryIcon,
  ShieldSecondaryIcon,
  NoShieldSecondaryIcon,
} = icons

export interface GetFlowHeaderProps {
  accountName?: string
  liveAccountGuardianState?: LiveAccountGuardianState
}

const useFlowHeaderProps = ({
  liveAccountGuardianState,
  accountName,
}: GetFlowHeaderProps): FlowHeaderProps => {
  const [finalStatus, setFinalStatus] = useState<string | null>(null)

  // Set final status when the transaction is done, so that it won't change back to 'UNKNOWN' once the tx is processed
  useEffect(() => {
    if (liveAccountGuardianState) {
      const { status } = liveAccountGuardianState
      if (status === "ERROR" || status === "SUCCESS") {
        setFinalStatus(status)
      }
    }
  }, [liveAccountGuardianState])

  if (!liveAccountGuardianState) {
    return {
      title: "Argent account",
    }
  }
  const { status, type } = liveAccountGuardianState

  const currentStatus = finalStatus || status

  const isAdding = type === ChangeGuardian.ADDING
  if (currentStatus === "ERROR") {
    return {
      icon: WarningCircleSecondaryIcon,
      title: isAdding
        ? "Upgrading to Smart Account Failed"
        : "Changing to Standard Account Failed",
      subtitle: `${accountName} was not modified because the transaction failed. Please try again later`,
      variant: "danger",
    }
  }
  if (currentStatus === "PENDING") {
    return {
      icon: isAdding ? ShieldSecondaryIcon : NoShieldSecondaryIcon,
      title: isAdding ? "Upgrading account…" : "Changing to Standard Account…",
      subtitle: isAdding ? (
        <>
          {accountName} will be protected by a guardian. A{" "}
          <ShieldSecondaryIcon
            display={"inline"}
            position={"relative"}
            top={"0.125em"}
          />{" "}
          icon will appear next to your account name once it’s activated
        </>
      ) : (
        <>
          Argent as a guardian is being removed on {accountName}. This can take
          a few minutes
        </>
      ),
      isLoading: true,
    }
  }
  if (currentStatus === "SUCCESS") {
    return {
      icon: CheckmarkSecondaryIcon,
      title: isAdding ? "Account upgraded" : "Changed to Standard Account",
      subtitle: isAdding
        ? `${accountName} has been upgraded to a Smart Account`
        : `Argent as a guardian has been removed on ${accountName}`,
      variant: "success",
    }
  }
  /** 'UNKNOWN' - no transaction */
  return {
    title: "Argent account",
  }
}

export interface SmartAccountBaseFinishScreenProps {
  accountName?: string
  liveAccountGuardianState?: LiveAccountGuardianState
  returnRoute: To
}

export const SmartAccountBaseFinishScreen: FC<
  SmartAccountBaseFinishScreenProps
> = ({ accountName, liveAccountGuardianState, returnRoute }) => {
  const navigate = useNavigate()

  const headerProps = useFlowHeaderProps({
    accountName,
    liveAccountGuardianState,
  })

  const onFinish = useCallback(() => {
    navigate(returnRoute)
  }, [navigate, returnRoute])
  return (
    <CellStack flex={1}>
      <Center flex={1} flexDirection={"column"}>
        <FlowHeader size={"lg"} icon={ShieldSecondaryIcon} {...headerProps} />
      </Center>
      <Button onClick={onFinish} colorScheme={"primary"}>
        {headerProps.isLoading ? "Dismiss" : "Done"}
      </Button>
    </CellStack>
  )
}
