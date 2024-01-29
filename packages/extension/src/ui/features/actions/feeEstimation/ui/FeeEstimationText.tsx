import { L2, P4, icons } from "@argent/ui"
import {
  // Center,
  Flex,
  Spinner,
  Text,
  ThemingProps,
  Tooltip,
} from "@chakra-ui/react"
import { FC, ReactNode } from "react"
// import { TokenPicker } from "./TokenPicker"

const { InfoIcon } = icons

export interface FeeEstimationTextProps extends ThemingProps<"Flex"> {
  allowFeeTokenSelection?: boolean
  title?: ReactNode
  subtitle?: ReactNode
  tooltipText?: ReactNode
  primaryText?: ReactNode
  secondaryText?: ReactNode
  isLoading?: boolean
}

export const FeeEstimationText: FC<FeeEstimationTextProps> = ({
  // allowFeeTokenSelection = true,
  colorScheme = "neutrals",
  tooltipText,
  title = "Estimated fee",
  subtitle,
  isLoading = false,
  primaryText,
  secondaryText,
}) => {
  return (
    <Flex flex={1} flexDirection="column" gap={1}>
      <Flex flexDirection={"row"} justifyContent="space-between">
        <Flex flexDirection="column" gap={1}>
          <Flex alignItems="center" gap="5px" mr={2} flexShrink={0}>
            <Flex alignItems="center" justifyContent="center" gap="5px">
              <P4
                fontWeight="medium"
                color={`${colorScheme}.300`}
                noOfLines={1}
              >
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
          </Flex>
          {subtitle && <L2 color={`${colorScheme}.300`}>{subtitle}</L2>}
        </Flex>
        {isLoading ? (
          <Spinner size={"sm"} />
        ) : (
          <Flex gap="1" alignItems="end" direction="column" flexWrap="wrap">
            {primaryText && (
              <Flex gap="2" mr={2} alignItems={"center"}>
                {/* {!allowFeeTokenSelection && (
                  <TokenPicker
                    selected={{
                      name: "Starknet Network",
                      symbol: "ETH",
                      image: "https://argent.xyz/images/eth.svg",
                    }}
                    onClick={() => setIsTokenPickerOpen(true)}
                  />
                )} */}
                <P4 fontWeight="medium">{primaryText}</P4>
              </Flex>
            )}
            {secondaryText && (
              <L2 color={`${colorScheme}.300`}>{secondaryText}</L2>
            )}
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
