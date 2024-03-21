import { Button, FlowHeader, P4, icons } from "@argent/x-ui"
import { Flex, VStack } from "@chakra-ui/react"
import { FC } from "react"

import { ESCAPE_SECURITY_PERIOD_DAYS } from "../../../../shared/account/details/escape.model"

import { ZENDESK_LINK } from "../../userReview/constants"
import {
  ESCAPE_GUARDIAN_LINK,
  ShieldExternalLinkButton,
} from "../ui/ShieldExternalLinkButton"
import { getEscapeDisplayAttributes } from "./EscapeBanner"
import { LiveAccountEscapeProps } from "./useAccountEscape"

const { AlertIcon } = icons

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
        icon={AlertIcon}
        title={title}
        subtitle={`In ${activeFromNowPretty} this account will be controlled by another key.`}
        variant={colorScheme}
      />
      <P4 color="neutrals.400">
        If you don’t recognize this action,{" "}
        <strong>please contact Argent Support</strong>.
      </P4>
      <P4 color="neutrals.400" mt={4}>
        If you can’t reach Argent support within {activeFromNowPretty}, we
        recommend you start Argent Shield removal process. This will take{" "}
        {ESCAPE_SECURITY_PERIOD_DAYS} days. Check detailed instructions here:
      </P4>
      <ShieldExternalLinkButton
        onClick={() => undefined}
        href={ESCAPE_GUARDIAN_LINK}
        my={3}
      >
        Detailed instructions
      </ShieldExternalLinkButton>
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
        <Button onClick={onRemove}>Start Argent Shield removal process</Button>
      </VStack>
    </Flex>
  )
}
