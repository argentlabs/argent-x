import { Box, Circle, Flex, Image, Tooltip } from "@chakra-ui/react"
import { ComponentProps, FC, ReactNode } from "react"

import { Button } from "./Button"
import { AlertIcon } from "./icons"
import { LoadingPulse } from "./LoadingPulse"
import { FieldError, H6, P4 } from "./Typography"

export interface TokenListItemProps extends ComponentProps<typeof Button> {
  name: string
  symbol: string
  image: string
  getTokenIconUrl: ({ name, url }: { name: string; url: string }) => string

  subtitle?: string | ReactNode
  valueLabelPrimary: string | ReactNode
  valueLabelSecondary?: string | ReactNode | undefined

  isLoading?: boolean
  showTokenSymbol?: boolean
  errorMessage?: {
    message: string
    description: string
  }
}

const TokenButton: FC<TokenListItemProps> = ({
  name,
  symbol,
  image,
  balance,
  getTokenIconUrl,
  variant,

  valueLabelPrimary,
  valueLabelSecondary,
  subtitle,

  isLoading = false,
  showTokenSymbol = false,
  currencyValue,
  errorMessage,
  ...rest
}) => {
  const src = getTokenIconUrl({ name, url: image })

  return (
    <Button
      gap={3}
      p={4}
      h={"initial"}
      textAlign={"left"}
      fontWeight={"initial"}
      colorScheme="neutrals"
      rounded={"xl"}
      {...rest}
    >
      <Circle position={"relative"} overflow={"hidden"} size={9}>
        <Image
          position={"absolute"}
          left={0}
          right={0}
          top={0}
          bottom={0}
          alt={name}
          src={src}
        />
      </Circle>
      <Flex
        flexGrow={1}
        alignItems="center"
        justifyContent={"space-between"}
        gap={2}
        overflow={"hidden"}
      >
        <Flex direction={"column"} overflow="hidden">
          <H6 overflow="hidden" textOverflow={"ellipsis"}>
            {name === "Ether" ? "Ethereum" : name}
          </H6>
          {subtitle === "default" && (
            <LoadingPulse isLoading={isLoading}>
              <P4
                color="neutrals.300"
                fontWeight={"semibold"}
                overflow="hidden"
                textOverflow={"ellipsis"}
              >
                {subtitle}
              </P4>
            </LoadingPulse>
          )}
          {!subtitle && showTokenSymbol && (
            <P4 color="neutrals.400" fontWeight={"semibold"}>
              {symbol}
            </P4>
          )}
        </Flex>
        <Flex direction={"column"} overflow="hidden">
          <LoadingPulse isLoading={isLoading}>
            {errorMessage ? (
              <Tooltip label={errorMessage.description}>
                <FieldError
                  overflow="hidden"
                  textOverflow={"ellipsis"}
                  display="flex"
                  gap="1"
                >
                  <AlertIcon />
                  {errorMessage.message}
                </FieldError>
              </Tooltip>
            ) : (
              <>
                <H6 overflow="hidden" textOverflow={"ellipsis"} textAlign="end">
                  {valueLabelPrimary}
                </H6>
                {valueLabelSecondary && (
                  <Box
                    color="neutrals.400"
                    fontWeight={"semibold"}
                    textOverflow={"ellipsis"}
                    textAlign="end"
                  >
                    {valueLabelSecondary}
                  </Box>
                )}
              </>
            )}
          </LoadingPulse>
        </Flex>
      </Flex>
    </Button>
  )
}

export { TokenButton }
