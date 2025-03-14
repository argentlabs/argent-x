import {
  HelpCircleSecondaryIcon,
  ArrowLeftPrimaryIcon,
} from "@argent/x-ui/icons"
import { Button, H1, P1 } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { isNumber } from "lodash-es"
import type { FC, MouseEventHandler, PropsWithChildren, ReactNode } from "react"

import {
  OnboardingIllustration,
  OnboardingContent,
  OnboardingContainer,
} from "./OnboardingContainer"
import { StepIndicator } from "../../../components/StepIndicator"

interface OnboardingScreenProps extends PropsWithChildren {
  title?: string
  subtitle?: string | ReactNode
  length?: number
  currentIndex?: number
  illustration?: OnboardingIllustration
  onBack?: MouseEventHandler
}

export const OnboardingScreen: FC<OnboardingScreenProps> = ({
  title,
  subtitle,
  length,
  currentIndex,
  onBack,
  illustration,
  children,
}) => {
  const indicator = isNumber(length) && isNumber(currentIndex)
  return (
    <OnboardingContainer>
      <OnboardingIllustration illustration={illustration} />
      <OnboardingContent>
        {onBack && (
          <Button
            size={{ base: "sm", md: "lg" }}
            position={{ md: "absolute" }}
            left={8}
            top={8}
            onClick={onBack}
            bgColor={{ md: "surface-default" }}
            mb={4}
          >
            <ArrowLeftPrimaryIcon fontSize={{ base: "base", md: "2xl" }} />
          </Button>
        )}
        <Button
          size="sm"
          bg="surface-default"
          border="1px solid"
          borderColor="surface-sunken"
          position={"absolute"}
          right={8}
          bottom={8}
          as="a"
          href="https://support.argent.xyz/hc/en-us/categories/5767453283473-Argent-X"
          target="_blank"
          leftIcon={<HelpCircleSecondaryIcon />}
        >
          Help
        </Button>
        {indicator && (
          <StepIndicator filled length={length} currentIndex={currentIndex} />
        )}
        <Flex flexDirection={"column"} gap={2} mt={10} mb={8}>
          {title && <H1>{title}</H1>}
          {subtitle && <P1 color="text-secondary-web">{subtitle}</P1>}
        </Flex>
        {children}
      </OnboardingContent>
    </OnboardingContainer>
  )
}
