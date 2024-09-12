import { P2, iconsDeprecated, B3, H2, logosDeprecated } from "@argent/x-ui"
import { Box, Button, Center, chakra, VStack } from "@chakra-ui/react"
import { isString } from "lodash-es"
import { FC, PropsWithChildren, ReactNode } from "react"
import { ContentWrapper } from "../../../components/FullScreenPage"
import { StepIndicator } from "../../../components/StepIndicator"

const { ArgentXLogoFull } = logosDeprecated
const { HelpIcon } = iconsDeprecated

export interface LedgerScreenLayoutProps extends PropsWithChildren {
  back?: boolean
  title?: string | ReactNode
  subtitle?: string | ReactNode
  length?: number
  currentIndex?: number
  goBack?: () => void
  sidePanel?: ReactNode
  helpLink?: string
  filledIndicator?: boolean
}

interface PageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  sidePanel?: ReactNode
}

export const PageWrapper = ({
  children,
  sidePanel,
  ...rest
}: PageWrapperProps) => {
  return (
    <Box
      display="flex"
      flexDirection={{ base: "column-reverse", md: "row" }}
      justifyContent={{ base: "flex-end", md: "flex-start" }}
      width="100%"
      marginTop={{ base: "max(120px, 15vh)", md: 0 }}
      height={{ md: "100vh" }}
      {...rest}
    >
      {children}
      {sidePanel}
    </Box>
  )
}

export const ScreenLayout: FC<LedgerScreenLayoutProps> = ({
  title,
  subtitle,
  children,
  length = 3,
  currentIndex = 0,
  sidePanel,
  helpLink,
  filledIndicator,
}) => {
  return (
    <PageWrapper sidePanel={sidePanel}>
      <Box
        position="absolute"
        left={8}
        top={8}
        width="unset"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
        py={6}
      >
        <ArgentXLogoFull h="34px" w="116px" />
      </Box>

      <Center flexDirection="column" w="full" px={0} py={4}>
        <ContentWrapper maxWidth="530px">
          <StepIndicator
            length={length}
            currentIndex={currentIndex}
            filled={filledIndicator}
          />
          <VStack mt={10} spacing={2} align="flex-start">
            {isString(title) ? <H2 marginBottom="0">{title}</H2> : <>{title}</>}
            {isString(subtitle) ? (
              <P2 color="neutrals.200">{subtitle}</P2>
            ) : (
              <>{subtitle}</>
            )}
          </VStack>
          {children}
        </ContentWrapper>
      </Center>
      {helpLink && <LedgerHelpButton helpLink={helpLink} />}
    </PageWrapper>
  )
}

export const LedgerHelpButton: FC<{ helpLink: string }> = ({ helpLink }) => {
  const onHelpClick = () => {
    window.open(helpLink, "_blank")?.focus()
  }
  return (
    <Box
      position="absolute"
      left={6}
      bottom={6}
      width="unset"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={6}
    >
      <Button
        variant="outline"
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap="2"
        p="8px 10px 8px 8px"
        borderRadius="100px"
        border="1px solid"
        borderColor="neutrals.800"
        onClick={onHelpClick}
        minH="unset"
        minW="unset"
        height="auto"
      >
        <HelpIcon color="white" />
        <B3 color="white">Help</B3>
      </Button>
    </Box>
  )
}
