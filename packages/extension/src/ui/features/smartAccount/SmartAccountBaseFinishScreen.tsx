import {
  Button,
  CellStack,
  FlowHeader,
  FlowHeaderProps,
  iconsDeprecated,
} from "@argent/x-ui"
import { Center } from "@chakra-ui/react"
import { FC, useCallback } from "react"
import { To, useNavigate } from "react-router-dom"

import { LiveAccountGuardianState } from "./usePendingChangingGuardian"
import { ChangeGuardian } from "../../../shared/smartAccount/changeGuardianCallDataToType"

const {
  SmartAccountActiveIcon,
  SmartAccountInactiveIcon,
  TickIcon,
  AlertIcon,
} = iconsDeprecated

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
      title: "Argent account",
    }
  }
  const { status, type } = liveAccountGuardianState
  const isAdding = type === ChangeGuardian.ADDING
  if (status === "ERROR") {
    return {
      icon: AlertIcon,
      title: isAdding
        ? "Upgrading to Smart Account Failed"
        : "Changing to Standard Account Failed",
      subtitle: `${accountName} was not modified because the transaction failed. Please try again later`,
      variant: "danger",
    }
  }
  if (status === "PENDING") {
    return {
      icon: isAdding ? SmartAccountActiveIcon : SmartAccountInactiveIcon,
      title: isAdding ? "Upgrading account…" : "Changing to Standard Account…",
      subtitle: isAdding ? (
        <>
          {accountName} will be protected by a guardian. A{" "}
          <SmartAccountActiveIcon
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
  if (status === "SUCCESS") {
    return {
      icon: TickIcon,
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

  const headerProps = getFlowHeaderProps({
    accountName,
    liveAccountGuardianState,
  })

  const onFinish = useCallback(() => {
    navigate(returnRoute)
  }, [navigate, returnRoute])
  return (
    <CellStack flex={1}>
      <Center flex={1} flexDirection={"column"}>
        <FlowHeader
          size={"lg"}
          icon={SmartAccountActiveIcon}
          {...headerProps}
        />
      </Center>
      <Button onClick={onFinish} colorScheme={"primary"}>
        {headerProps.isLoading ? "Dismiss" : "Done"}
      </Button>
    </CellStack>
  )
}
