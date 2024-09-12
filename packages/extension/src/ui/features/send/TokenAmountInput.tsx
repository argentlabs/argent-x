import {
  Button,
  L2,
  iconsDeprecated,
  typographyStyles,
  TokenIcon,
} from "@argent/x-ui"
import { Flex, InputProps, Spinner, chakra } from "@chakra-ui/react"
import { ReactNode, forwardRef, useCallback, useMemo, useState } from "react"
import Measure, { ContentRect } from "react-measure"

import { clientTokenService } from "../../services/tokens"
import { Token } from "../../../shared/token/__new/types/token.model"

const { ChevronDownIcon } = iconsDeprecated

interface TokenAmountInputProps extends InputProps {
  token: Token
  showMaxButton?: boolean
  onMaxClick?: () => void
  onTokenClick?: () => void
  leftText?: ReactNode
  rightText?: ReactNode
  defaultFontSize?: number
  minimumFontSize?: number
  isMaxLoading?: boolean
}

const TokenAmountInput = forwardRef<HTMLInputElement, TokenAmountInputProps>(
  (
    {
      token,
      showMaxButton,
      isMaxLoading,
      onMaxClick,
      onTokenClick,
      isInvalid,
      leftText,
      rightText,
      value,
      defaultFontSize = 24,
      minimumFontSize = 11,
      ...rest
    },
    ref,
  ) => {
    /**
     * Keep track of 'full size' text vs size of the actual input
     * Reduce font size proportionally if 'full size' text exceeds input width
     */
    const [inputWidth, setInputWidth] = useState<number | null>(null)
    const onInputResize = useCallback((contentRect: ContentRect) => {
      setInputWidth(contentRect.bounds?.width ?? null)
    }, [])

    const [fullSizeTextWidth, setFullSizeTextWidth] = useState<number | null>(
      null,
    )
    const onFullSizeTextResize = useCallback((contentRect: ContentRect) => {
      setFullSizeTextWidth(contentRect.bounds?.width ?? null)
    }, [])

    const fontSize = useMemo(() => {
      if (fullSizeTextWidth === null || inputWidth === null) {
        return defaultFontSize
      }
      let multiplier = 1
      const ratio = fullSizeTextWidth / inputWidth
      if (ratio > 1) {
        multiplier = 1 / ratio
      }
      return Math.max(defaultFontSize * multiplier, minimumFontSize)
    }, [defaultFontSize, fullSizeTextWidth, inputWidth, minimumFontSize])

    const {
      name,
      iconUrl: image,
      symbol,
    } = clientTokenService.toTokenView(token)
    return (
      <Flex
        gap={1}
        p={4}
        rounded={"xl"}
        background={"neutrals.800"}
        direction={"column"}
      >
        <Flex flex={1} gap={1}>
          <Measure bounds onResize={onInputResize}>
            {({ measureRef }) => (
              <Flex ref={measureRef} w={"full"}>
                <chakra.input
                  ref={ref}
                  autoComplete={"off"}
                  w={"full"}
                  bg={"transparent"}
                  placeholder={"0"}
                  color={isInvalid ? "error.500" : "text-primary"}
                  _placeholder={{ color: "neutrals.500" }}
                  _focus={{ outline: "none" }}
                  value={value}
                  {...typographyStyles.H4}
                  fontSize={`${fontSize}px`}
                  {...rest}
                />
              </Flex>
            )}
          </Measure>
          <Measure bounds onResize={onFullSizeTextResize}>
            {({ measureRef }) => (
              <Flex
                ref={measureRef}
                position={"fixed"}
                visibility={"hidden"}
                {...typographyStyles.H4}
              >
                {value}
              </Flex>
            )}
          </Measure>
          <Button
            size={"3xs"}
            leftIcon={<TokenIcon size={5} url={image} name={name} mr={2} />}
            rightIcon={<ChevronDownIcon fontSize={"2xs"} mx={1} />}
            minHeight={0}
            bg="surface-default"
            p={1}
            onClick={onTokenClick}
            sx={{
              ".chakra-button__icon": {
                margin: 0,
              },
            }}
          >
            {symbol}
          </Button>
        </Flex>
        <Flex
          justifyContent={"space-between"}
          color={"neutrals.400"}
          alignItems={"center"}
          w={"full"}
          overflow={"hidden"}
        >
          {showMaxButton ? (
            isMaxLoading ? (
              <Spinner color={"primary.500"} w={2} h={2} thickness={"1px"} />
            ) : (
              <Button
                colorScheme="transparent"
                size="auto"
                rounded="none"
                color="primary.500"
                cursor="pointer"
                _hover={{ color: "primary.400" }}
                onClick={onMaxClick}
                {...typographyStyles.L2}
              >
                Max
              </Button>
            )
          ) : (
            <L2 noOfLines={1}>{leftText}</L2>
          )}
          {rightText && (
            <L2 noOfLines={1} textAlign={"right"}>
              {rightText}
            </L2>
          )}
        </Flex>
      </Flex>
    )
  },
)

TokenAmountInput.displayName = "TokenAmountInput"

export { TokenAmountInput }
