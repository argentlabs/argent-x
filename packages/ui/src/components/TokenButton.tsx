import {
  Box,
  ButtonProps,
  Circle,
  Fade,
  Flex,
  Image,
  Tooltip,
} from "@chakra-ui/react"
import { FC, ReactNode, useState } from "react"

import { Button } from "./Button"
import { AlertIcon } from "./icons"
import { LoadingPulse } from "./LoadingPulse"
import { FieldError, H6, P4 } from "./Typography"

export interface TokenButtonProps extends ButtonProps {
  name: string
  symbol: string
  image: string
  bigFont?: boolean
  getTokenIconUrl: ({ name, url }: { name: string; url: string }) => string
  subtitle?: string | ReactNode
  hoverButton?: ReactNode
  valueLabelPrimary: string | ReactNode
  valueLabelSecondary?: string | ReactNode | undefined
  isLoading?: boolean
  showTokenSymbol?: boolean
  errorMessage?: {
    message: string
    description: string
  }
}

const TokenButton: FC<TokenButtonProps> = ({
  name,
  symbol,
  image,
  getTokenIconUrl,
  hoverButton,
  valueLabelPrimary,
  valueLabelSecondary,
  subtitle,
  isLoading = false,
  showTokenSymbol = false,
  errorMessage,
  bigFont,
  ...rest
}) => {
  const src = getTokenIconUrl({ name, url: image })
  const [isHovering, setHovering] = useState(false)

  const handleMouseEnter = () => {
    setHovering(true)
  }
  const handleMouseLeave = () => {
    setHovering(false)
  }

  return (
    <Button
      gap={3}
      p={4}
      h={"initial"}
      textAlign={"left"}
      fontWeight={"initial"}
      colorScheme="neutrals"
      rounded={"xl"}
      cursor={hoverButton ? "default" : "pointer"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        <Flex direction={"column"} overflow="hidden" gap="0.5">
          <H6
            overflow="hidden"
            textOverflow={"ellipsis"}
            fontSize={bigFont ? "2xl" : "base"}
            pb={"1.5"}
          >
            {name === "Ether" ? "Ethereum" : name}
          </H6>
          {subtitle === "default" && (
            <LoadingPulse isLoading={isLoading}>
              <P4
                color="neutrals.300"
                fontWeight={bigFont ? "" : "semibold"}
                overflow="hidden"
                textOverflow={"ellipsis"}
                fontSize={bigFont ? "base" : "xs"}
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
        <LoadingPulse isLoading={isLoading}>
          <Flex
            direction={"column"}
            overflow="hidden"
            gap={bigFont ? "1.5" : 0}
          >
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
                {isHovering && hoverButton ? (
                  <Fade in={isHovering}>{hoverButton}</Fade>
                ) : (
                  <>
                    <H6
                      overflow="hidden"
                      textOverflow={"ellipsis"}
                      textAlign="end"
                      fontSize={bigFont ? "2xl" : "base"}
                    >
                      {valueLabelPrimary}
                    </H6>
                    {valueLabelSecondary && (
                      <Box
                        color="neutrals.400"
                        fontWeight="semibold"
                        textOverflow={"ellipsis"}
                        textAlign="end"
                        fontSize="xs"
                      >
                        {valueLabelSecondary}
                      </Box>
                    )}
                  </>
                )}
              </>
            )}
          </Flex>
        </LoadingPulse>
      </Flex>
    </Button>
  )
}

export { TokenButton }
