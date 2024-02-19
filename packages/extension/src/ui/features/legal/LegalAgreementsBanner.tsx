import { FC, ReactEventHandler } from "react"
import { P4 } from "@argent/ui"
import { Button, Flex, FlexProps, Link } from "@chakra-ui/react"

import {
  ARGENT_X_LEGAL_PRIVACY_POLICY_URL,
  ARGENT_X_LEGAL_TERMS_OF_SERVICE_URL,
} from "../../../shared/api/constants"

interface LegalAgreementsBannerProps extends FlexProps {
  onAgree: ReactEventHandler
}

export const LegalAgreementsBanner: FC<LegalAgreementsBannerProps> = ({
  onAgree,
  ...rest
}) => {
  return (
    <Flex
      bg={"surface.default"}
      p={4}
      gap={2}
      alignItems={"center"}
      borderTop="1px solid"
      borderTopColor="border"
      {...rest}
    >
      <P4 color="text.secondary">
        We’ve updated our terms, please accept the new{" "}
        <Link
          href={ARGENT_X_LEGAL_TERMS_OF_SERVICE_URL}
          target="_blank"
          color="primary.500"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href={ARGENT_X_LEGAL_PRIVACY_POLICY_URL}
          target="_blank"
          color="primary.500"
        >
          Privacy Policy
        </Link>
      </P4>
      <Button onClick={onAgree} colorScheme="primary" size={"sm"}>
        Agree
      </Button>
    </Flex>
  )
}
