import {
  Button,
  H3,
  NavigationContainer,
  P3,
  StickyGroup,
  iconsDeprecated,
} from "@argent/x-ui"
import { Box, Center, Circle, Flex } from "@chakra-ui/react"
import { FC, isValidElement, useCallback, useState } from "react"
import Measure, { ContentRect } from "react-measure"

const { AlertIcon } = iconsDeprecated

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
            <AlertIcon color="primary.500" fontSize="5xl" />
          </Circle>
          <Flex flexDirection="column" align="center" justify="center" gap="3">
            {isValidElement(title) ? (
              title
            ) : (
              <H3 textAlign="center">{title}</H3>
            )}
            {description &&
              (isValidElement(description) ? (
                description
              ) : (
                <P3 color="neutrals.300" textAlign="center">
                  {description}
                </P3>
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
