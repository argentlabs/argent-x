import { WarningCircleSecondaryIcon } from "@argent/x-ui/icons"
import { Button, FlowHeader, P3 } from "@argent/x-ui"
import { Flex, VStack } from "@chakra-ui/react"
import type { FC } from "react"

import { ESCAPE_SECURITY_PERIOD_DAYS } from "../../../../shared/account/details/escape.model"

import { ZENDESK_LINK } from "../../userReview/constants"
import {
  ESCAPE_GUARDIAN_LINK,
  SmartAccountExternalLinkButton,
} from "../ui/SmartAccountExternalLinkButton"
import { getEscapeDisplayAttributes } from "./getEscapeDisplayAttributes"
import type { LiveAccountEscapeProps } from "./useAccountEscape"

interface EscapeSignerProps {
  liveAccountEscape: LiveAccountEscapeProps
  onCancel: () => void
  onRemove: () => void
}

export const EscapeSigner: FC<EscapeSignerProps> = ({
  liveAccountEscape,
  onCancel,
  onRemove,
}) => {
  const { activeFromNowPretty } = liveAccountEscape
  const { colorScheme, title } = getEscapeDisplayAttributes(liveAccountEscape)
  return (
    <Flex flexDirection={"column"} flex={1} px={4} pt={8} pb={4}>
      <FlowHeader
        icon={WarningCircleSecondaryIcon}
        title={title}
        subtitle={`In ${activeFromNowPretty} this account will be controlled by another key.`}
        variant={colorScheme}
      />
      <P3 color="neutrals.400">
        If you don’t recognize this action,{" "}
        <strong>please contact Argent Support</strong>.
      </P3>
      <P3 color="neutrals.400" mt={4}>
        If you can’t reach Argent support within {activeFromNowPretty}, we
        recommend you start Argent Guardian removal process. This will take{" "}
        {ESCAPE_SECURITY_PERIOD_DAYS} days. Check detailed instructions here:
      </P3>
      <SmartAccountExternalLinkButton
        onClick={() => undefined}
        href={ESCAPE_GUARDIAN_LINK}
        my={3}
      >
        Detailed instructions
      </SmartAccountExternalLinkButton>
      <Flex flex={1} />
      <VStack spacing={1} alignItems={"stretch"}>
        <Button
          onClick={() => undefined}
          as={"a"}
          colorScheme={"primary"}
          href={ZENDESK_LINK}
          target="_blank"
        >
          Contact Argent Support
        </Button>
        <Button onClick={onCancel}>Cancel key change</Button>
        <Button onClick={onRemove}>
          Start Argent Guardian removal process
        </Button>
      </VStack>
    </Flex>
  )
}
