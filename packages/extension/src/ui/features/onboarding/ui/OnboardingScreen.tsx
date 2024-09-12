import { Button, H2, P1, iconsDeprecated, logosDeprecated } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { isNumber } from "lodash-es"
import { FC, MouseEventHandler, PropsWithChildren, ReactNode } from "react"

import {
  ContentWrapper,
  DecoratedPanel,
  PageWrapper,
  Panel,
} from "../../../components/FullScreenPage"
import { StepIndicator } from "../../../components/StepIndicator"

const { ArrowLeftIcon } = iconsDeprecated
const { ArgentXLogo } = logosDeprecated

interface OnboardingScreenProps extends PropsWithChildren {
  title?: string
  subtitle?: string | ReactNode
  length?: number
  currentIndex?: number
  icon?: ReactNode
  onBack?: MouseEventHandler
}

export const OnboardingScreen: FC<OnboardingScreenProps> = ({
  title,
  subtitle,
  length,
  currentIndex,
  onBack,
  icon = <ArgentXLogo />,
  children,
}) => {
  const indicator = isNumber(length) && isNumber(currentIndex)
  return (
    <PageWrapper>
      {onBack && (
        <Button
          size={"lg"}
          position={"absolute"}
          left={8}
          top={8}
          onClick={onBack}
        >
          <ArrowLeftIcon fontSize={"2xl"} />
        </Button>
      )}
      <Panel>
        <ContentWrapper>
          {indicator && (
            <StepIndicator length={length} currentIndex={currentIndex} />
          )}
          <Flex flexDirection={"column"} gap={2} my={8}>
            {title && <H2>{title}</H2>}
            {subtitle && <P1 color="text-secondary-web">{subtitle}</P1>}
          </Flex>
          {children}
        </ContentWrapper>
      </Panel>
      <DecoratedPanel fontSize={"80px"}>{icon}</DecoratedPanel>
    </PageWrapper>
  )
}
