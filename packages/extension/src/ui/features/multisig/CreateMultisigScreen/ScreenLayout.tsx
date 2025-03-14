import { ArrowLeftPrimaryIcon } from "@argent/x-ui/icons"
import { MassiveTitle, P1 } from "@argent/x-ui"
import { Box, Button } from "@chakra-ui/react"
import { isNumber } from "lodash-es"
import type { FC, PropsWithChildren, ReactNode } from "react"

import { ContentWrapper } from "../../../components/FullScreenPage"
import { StepIndicator } from "../../../components/StepIndicator"

import { ArgentXLogo } from "@argent/x-ui/logos-deprecated"

export interface CreateMultisigScreen extends PropsWithChildren {
  back?: boolean
  title?: string | ReactNode
  subtitle?: string
  length?: number
  currentIndex?: number
  goBack?: () => void
  filledIndicator?: boolean
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
        background={`url('./assets/onboarding-background.jpg') no-repeat center`}
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
  filledIndicator,
}) => {
  const indicator = isNumber(length) && isNumber(currentIndex)

  return (
    <PageWrapper>
      {back && goBack && (
        <Button
          size={"lg"}
          position={"absolute"}
          left={8}
          top={8}
          onClick={goBack}
        >
          <ArrowLeftPrimaryIcon fontSize={"2xl"} />
        </Button>
      )}
      <Panel>
        <ContentWrapper>
          {indicator && (
            <StepIndicator
              length={length}
              currentIndex={currentIndex}
              filled={filledIndicator}
            />
          )}
          <Box my={8} mx={0}>
            {title && typeof title === "string" ? (
              <MassiveTitle marginBottom="0">{title}</MassiveTitle>
            ) : (
              <>{title}</>
            )}
            {subtitle && (
              <P1 mt={2} color="neutrals.100">
                {subtitle}
              </P1>
            )}
          </Box>
          {children}
        </ContentWrapper>
      </Panel>
    </PageWrapper>
  )
}
