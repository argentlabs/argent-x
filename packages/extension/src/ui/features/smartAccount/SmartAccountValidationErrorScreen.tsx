import {
  BarBackButton,
  Button,
  CellStack,
  FlowHeader,
  icons,
  NavigationContainer,
} from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback } from "react"

import type { SmartAccountValidationErrorMessage } from "../../../shared/errors/argentAccount"
import SmartAccountError from "./ui/SmartAccountError"

const { WarningCircleSecondaryIcon } = icons

export interface SmartAccountValidationErrorScreenProps {
  onBack?: () => void
  error: SmartAccountValidationErrorMessage
  onDone: () => void
}

export const SmartAccountValidationErrorScreen: FC<
  SmartAccountValidationErrorScreenProps
> = ({ onBack, error, onDone }) => {
  const onDoneClick = useCallback(() => {
    onDone()
  }, [onDone])

  return (
    <NavigationContainer
      leftButton={onBack ? <BarBackButton onClick={onBack} /> : null}
      title={"Smart Account"}
    >
      <CellStack flex={1}>
        <FlowHeader
          icon={WarningCircleSecondaryIcon}
          title={"Oops, wrong email"}
          subtitle={<SmartAccountError error={error} />}
        />
        <Flex flex={1} />
        <Button onClick={onDoneClick} colorScheme={"primary"}>
          Try again
        </Button>
      </CellStack>
    </NavigationContainer>
  )
}
