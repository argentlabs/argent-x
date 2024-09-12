import {
  BarBackButton,
  Button,
  CellStack,
  FlowHeader,
  NavigationContainer,
  iconsDeprecated,
} from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC, useCallback } from "react"

import { SmartAccountValidationErrorMessage } from "../../../shared/errors/argentAccount"
import SmartAccountError from "./ui/SmartAccountError"

const { AlertIcon } = iconsDeprecated

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
          icon={AlertIcon}
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
