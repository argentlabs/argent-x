import { H1, P2 } from "@argent/ui"
import { Box, Button } from "@chakra-ui/react"
import { isNumber } from "lodash-es"
import { FC, PropsWithChildren, ReactNode } from "react"
import styled from "styled-components"

import {
  ContentWrapper,
  PageWrapper,
  Panel,
} from "../../../../components/FullScreenPage"
import { ArrowBackIcon } from "../../../../components/Icons/MuiIcons"
import { StepIndicator } from "../../../../components/StepIndicator"
import LogoSvg from "../../../lock/logo.svg"

export interface CreateMultisigScreen extends PropsWithChildren {
  back?: boolean
  title?: string | ReactNode
  subtitle?: string
  length?: number
  currentIndex?: number
  icon?: ReactNode
  goBack?: () => void
}

const StyledPageWrapper = styled(PageWrapper)`
  ${({ theme }) => theme.mediaMinWidth.md`
    > ${Panel}:last-child {
      background:url('./assets/onboarding-background.svg') no-repeat center;
      background-size: cover;
    }
  `}
`

export const ScreenLayout: FC<CreateMultisigScreen> = ({
  back,
  title,
  subtitle,
  children,
  length = 3,
  currentIndex,
  icon = <LogoSvg />,
  goBack,
}) => {
  const indicator = isNumber(length) && isNumber(currentIndex)

  return (
    <StyledPageWrapper>
      {back && goBack && (
        <Button
          position="absolute"
          left="32px"
          top="32px"
          width="unset"
          display="flex"
          alignItems="center"
          justifyContent="center"
          padding="16px 24px"
          backgroundColor="neutrals.800"
          onClick={() => goBack()}
        >
          <ArrowBackIcon />
        </Button>
      )}
      <Panel>
        <ContentWrapper>
          {indicator && (
            <StepIndicator length={length} currentIndex={currentIndex} />
          )}
          <Box margin="32px 0">
            {title && typeof title === "string" ? (
              <H1 marginBottom="0">{title}</H1>
            ) : (
              <>{title}</>
            )}
            {subtitle && (
              <P2 marginTop="8px" color="neutrals.100">
                {subtitle}
              </P2>
            )}
          </Box>
          {children}
        </ContentWrapper>
      </Panel>
      <Panel>{icon}</Panel>
    </StyledPageWrapper>
  )
}
