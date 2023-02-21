import { H1, P2 } from "@argent/ui"
import { Box, Button } from "@chakra-ui/react"
import { isNumber } from "lodash-es"
import { FC, PropsWithChildren, ReactNode } from "react"

import { ContentWrapper } from "../../../../components/FullScreenPage"
import { ArrowBackIcon } from "../../../../components/Icons/MuiIcons"
import { StepIndicator } from "../../../../components/StepIndicator"
import LogoSvg from "../../../lock/logo.svg"

export interface CreateMultisigScreen extends PropsWithChildren {
  back?: boolean
  title?: string | ReactNode
  subtitle?: string
  length?: number
  currentIndex?: number
  goBack?: () => void
}

const Panel = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    width="100%"
    padding="0 56px"
    {...props}
  />
)

const PageWrapper = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <Box
      display="flex"
      flexDirection={{ base: "column-reverse", md: "row" }}
      alignItems="center"
      justifyContent={{ base: "flex-end", md: "flex-start" }}
      width="100%"
      marginTop={{ base: "max(120px, 15vh)", md: 0 }}
      height={{ md: "100vh" }}
      {...props}
    >
      {props.children}
      <Box
        width={{ md: "40%" }}
        display={{ md: "flex" }}
        backgroundColor={{ md: "black" }}
        height={{ md: "100%" }}
        background={`url('./assets/onboarding-background.svg') no-repeat center`}
        backgroundSize="cover"
      >
        <Panel> {/* <LogoSvg /> */}</Panel>
      </Box>
    </Box>
  )
}

export const ScreenLayout: FC<CreateMultisigScreen> = ({
  back,
  title,
  subtitle,
  children,
  length = 3,
  currentIndex,
  goBack,
}) => {
  const indicator = isNumber(length) && isNumber(currentIndex)

  return (
    <PageWrapper>
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
    </PageWrapper>
  )
}
