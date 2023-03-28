import { H1, P2, logos } from "@argent/ui"
import { Box, Button } from "@chakra-ui/react"
import { isNumber } from "lodash-es"
import { FC, PropsWithChildren, ReactNode } from "react"

import { ContentWrapper } from "../../../components/FullScreenPage"
import { ArrowBackIcon } from "../../../components/Icons/MuiIcons"
import { StepIndicator } from "../../../components/StepIndicator"

const { ArgentXLogo } = logos

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
        <Panel>
          <ArgentXLogo w={20} h={20} />
        </Panel>
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
          left={8}
          top={8}
          width="unset"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
          py={6}
          backgroundColor="neutrals.800"
          onClick={goBack}
        >
          <ArrowBackIcon />
        </Button>
      )}
      <Panel>
        <ContentWrapper>
          {indicator && (
            <StepIndicator length={length} currentIndex={currentIndex} />
          )}
          <Box my={8} mx={0}>
            {title && typeof title === "string" ? (
              <H1 marginBottom="0">{title}</H1>
            ) : (
              <>{title}</>
            )}
            {subtitle && (
              <P2 mt={2} color="neutrals.100">
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
