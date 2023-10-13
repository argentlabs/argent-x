import { L2, P4, icons } from "@argent/ui"
import {
  Center,
  Flex,
  Spinner,
  Text,
  ThemingProps,
  Tooltip,
} from "@chakra-ui/react"
import { FC, ReactNode } from "react"

const { InfoIcon } = icons

export interface FeeEstimationTextProps extends ThemingProps<"Flex"> {
  title?: ReactNode
  subtitle?: ReactNode
  tooltipText?: ReactNode
  primaryText?: ReactNode
  secondaryText?: ReactNode
  isLoading?: boolean
}

export const FeeEstimationText: FC<FeeEstimationTextProps> = ({
  colorScheme = "neutrals",
  tooltipText,
  title = "Network fee",
  subtitle,
  isLoading = false,
  primaryText,
  secondaryText,
}) => {
  return (
    <Flex flex={1} flexDirection="column" gap={1}>
      <Flex flexDirection={"row"} justifyContent="space-between">
        <Center gap="5px" mr={2} flexShrink={0}>
          <Flex alignItems="center" justifyContent="center" gap="5px">
            <P4 fontWeight="medium" color={`${colorScheme}.300`} noOfLines={1}>
              {title}
            </P4>
          </Flex>
          {tooltipText && (
            <Tooltip label={tooltipText}>
              <Text
                color={`${colorScheme}.300`}
                fontSize={"2xs"}
                cursor="pointer"
                _hover={{ color: "white" }}
                aria-label={`Information about ${title}`}
              >
                <InfoIcon />
              </Text>
            </Tooltip>
          )}
        </Center>
        {isLoading ? (
          <Spinner size={"sm"} />
        ) : (
          <Flex
            gap="1"
            alignItems="center"
            direction="row-reverse"
            flexWrap="wrap"
          >
            {primaryText && <P4 fontWeight="medium">{primaryText}</P4>}
            {secondaryText && (
              <L2 color={`${colorScheme}.300`}>{secondaryText}</L2>
            )}
          </Flex>
        )}
      </Flex>
      {subtitle && <L2 color={`${colorScheme}.300`}>{subtitle}</L2>}
    </Flex>
  )
}
