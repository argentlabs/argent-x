import { L2, P4, icons } from "@argent/ui"
import { Center, Flex, Spinner, Text, Tooltip } from "@chakra-ui/react"
import { FC, ReactNode } from "react"

const { InfoIcon } = icons

interface FeeEstimationBoxProps {
  title?: ReactNode
  subtitle?: ReactNode
  tooltipText?: ReactNode
  primaryText?: ReactNode
  secondaryText?: ReactNode
  isLoading?: boolean
  hasError?: boolean
}

export const FeeEstimationBox: FC<FeeEstimationBoxProps> = ({
  tooltipText,
  title = "Network fee",
  subtitle,
  isLoading = false,
  hasError = false,
  primaryText,
  secondaryText,
}) => {
  return (
    <Flex
      borderRadius="xl"
      backgroundColor="neutrals.900"
      border="1px"
      borderColor="neutrals.500"
      boxShadow="menu"
      px={3}
      py={3.5}
      flexDirection="column"
      gap={1}
    >
      <Flex flexDirection={"row"} justifyContent="space-between">
        <Center gap="5px" mr={2} flexShrink={0}>
          <Flex alignItems="center" justifyContent="center" gap="5px">
            <P4 fontWeight="medium" color="neutrals.300" noOfLines={1}>
              {title}
            </P4>
          </Flex>
          {tooltipText && (
            <Tooltip label={tooltipText}>
              <Text
                color="neutrals.300"
                fontSize={"2xs"}
                cursor="pointer"
                _hover={{ color: "white" }}
              >
                <InfoIcon />
              </Text>
            </Tooltip>
          )}
        </Center>
        {isLoading ? (
          <Spinner size={"sm"} />
        ) : hasError ? (
          <P4 fontWeight="medium">Error</P4>
        ) : (
          <Flex
            gap="1"
            alignItems="center"
            direction="row-reverse"
            flexWrap="wrap"
          >
            {primaryText && <P4 fontWeight="medium">{primaryText}</P4>}
            {secondaryText && <L2 color="neutrals.300">{secondaryText}</L2>}
          </Flex>
        )}
      </Flex>
      {subtitle && <L2 color="neutrals.300">{subtitle}</L2>}
    </Flex>
  )
}
