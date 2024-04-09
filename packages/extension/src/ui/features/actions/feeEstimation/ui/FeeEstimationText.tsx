import { B3, L2, P4, icons } from "@argent/x-ui"
import {
  Center,
  Flex,
  Img,
  Spinner,
  Text,
  ThemingProps,
  Tooltip,
} from "@chakra-ui/react"
import { FC, ReactNode } from "react"

const { InfoIcon, ChevronRightIcon } = icons

export interface FeeEstimationTextProps extends ThemingProps<"Flex"> {
  allowFeeTokenSelection?: boolean
  title?: ReactNode
  subtitle?: ReactNode
  tooltipText?: ReactNode
  primaryText?: ReactNode
  secondaryText?: ReactNode
  isLoading?: boolean
  onOpenFeeTokenPicker?: () => void
  feeTokenIcon?: string
  feeTokenSymbol?: string
}

export const FeeEstimationText: FC<FeeEstimationTextProps> = ({
  allowFeeTokenSelection = true,
  colorScheme = "neutrals",
  tooltipText,
  title = "Estimated fee",
  subtitle,
  isLoading = false,
  primaryText,
  secondaryText,
  feeTokenIcon,
  feeTokenSymbol,
  onOpenFeeTokenPicker,
}) => {
  return (
    <Flex flex={1} flexDirection="column" gap={1}>
      <Flex
        flexDirection={"row"}
        justifyContent="space-between"
        alignItems="center"
      >
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
          <Flex
            data-testid="fee-token-picker"
            gap="2"
            alignItems="center"
            cursor={allowFeeTokenSelection ? "pointer" : "default"}
            onClick={() => allowFeeTokenSelection && onOpenFeeTokenPicker?.()}
            role="group"
          >
            <Flex gap="0.5" alignItems="end" direction="column" flexWrap="wrap">
              {primaryText && (
                <Flex gap="1" alignItems="center" justifyContent="center">
                  <Img
                    borderRadius="50%"
                    bg="neutrals.700"
                    src={feeTokenIcon}
                    alt={feeTokenSymbol}
                    height="16px"
                    width="16px"
                  />
                  <B3>{primaryText}</B3>
                </Flex>
              )}
              {secondaryText && (
                <L2 cursor="inherit" color={`${colorScheme}.300`}>
                  {secondaryText}
                </L2>
              )}
            </Flex>
            {allowFeeTokenSelection && (
              <Center
                rounded={"lg"}
                bg={`${colorScheme}.700`}
                p={1.5}
                alignSelf={"stretch"}
                _groupHover={{
                  bg: `${colorScheme}.600`,
                }}
                transitionProperty="common"
                transitionDuration="fast"
              >
                <ChevronRightIcon />
              </Center>
            )}
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
