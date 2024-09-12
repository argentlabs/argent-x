import { Button, FlowHeader, P3, iconsDeprecated } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import { ESCAPE_SECURITY_PERIOD_DAYS } from "../../../../shared/account/details/escape.model"

const { SmartAccountInactiveIcon } = iconsDeprecated

interface EscapeGuardianReadyProps {
  accountGuardianIsSelf: boolean | null
  onRemove: () => void
}

export const EscapeGuardianReady: FC<EscapeGuardianReadyProps> = ({
  accountGuardianIsSelf,
  onRemove,
}) => {
  const step = accountGuardianIsSelf ? 2 : 1
  const title = `Remove Argent as a guardian now (${step}/2)`
  const description =
    step == 1
      ? `2 transactions needed to remove Argent as a guardian due to our security model`
      : `1 more transaction needed to remove Argent as a guardian due to our security model`
  return (
    <Flex flexDirection={"column"} flex={1} px={4} pt={8} pb={4}>
      <FlowHeader
        icon={SmartAccountInactiveIcon}
        title={title}
        subtitle={`The ${ESCAPE_SECURITY_PERIOD_DAYS}-day security period is over. You can now remove Argent as a guardian`}
        variant={"warning"}
      />
      <P3 color="neutrals.100" textAlign={"center"}>
        <strong>{description}</strong>
      </P3>
      <Flex flex={1} />
      <Button colorScheme={"primary"} onClick={onRemove}>
        Remove Argent as a guardian
      </Button>
    </Flex>
  )
}
