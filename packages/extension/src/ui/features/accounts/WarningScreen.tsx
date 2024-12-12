import {
  Button,
  H2,
  icons,
  NavigationContainer,
  P2,
  StickyGroup,
} from "@argent/x-ui"
import { Box, Center, Circle, Flex } from "@chakra-ui/react"
import type { FC } from "react"
import { isValidElement, useCallback, useState } from "react"
import type { ContentRect } from "react-measure"
import Measure from "react-measure"

const { WarningCircleSecondaryIcon } = icons

export interface WarningScreenProps {
  title: React.ReactNode
  description?: React.ReactNode
  buttonLabel?: string
  onSubmit?: () => void
}

/** TODO: refactor: this does not belong in accounts folder */

export const WarningScreen: FC<WarningScreenProps> = ({
  title,
  description,
  buttonLabel,
  onSubmit,
  ...rest
}) => {
  const [placeholderHeight, setPlaceholderHeight] = useState(100)

  const onResize = useCallback((contentRect: ContentRect) => {
    const { height = 100 } = contentRect.bounds || {}
    setPlaceholderHeight(height)
  }, [])

  return (
    <NavigationContainer>
      <Flex pt="7" px="16px" pb="0" direction="column" gap="2" {...rest}>
        <Center flexDirection="column" gap="8">
          <Circle p="7" bgColor="primaryExtraDark.500">
            <WarningCircleSecondaryIcon color="primary.500" fontSize="5xl" />
          </Circle>
          <Flex flexDirection="column" align="center" justify="center" gap="3">
            {isValidElement(title) ? (
              title
            ) : (
              <H2 textAlign="center">{title}</H2>
            )}
            {description &&
              (isValidElement(description) ? (
                description
              ) : (
                <P2 color="neutrals.300" textAlign="center">
                  {description}
                </P2>
              ))}
          </Flex>
        </Center>

        <Box w="full" h={placeholderHeight} />

        <Measure bounds onResize={onResize}>
          {({ measureRef }) => (
            <StickyGroup ref={measureRef} px="4" pb="4">
              <Button
                w="full"
                type="button"
                colorScheme="primary"
                onClick={onSubmit}
              >
                {buttonLabel}
              </Button>
            </StickyGroup>
          )}
        </Measure>
      </Flex>
    </NavigationContainer>
  )
}
