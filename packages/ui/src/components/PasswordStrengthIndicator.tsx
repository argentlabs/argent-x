import { Box, Flex, ListItem, Tooltip, UnorderedList } from "@chakra-ui/react"
import { zxcvbnOptions } from "@zxcvbn-ts/core"
import { FC, PropsWithChildren, useMemo } from "react"
import { CustomError } from "ts-custom-error"

import { usePasswordStrength } from "../hooks/usePasswordStrength"
import { AlertIcon, TickCircleIcon } from "./icons"
import { H6 } from "./Typography"

class PasswordValidationError extends CustomError {
  public constructor(public code: number, message?: string) {
    super(message)
  }
}

interface PasswordErrorProps extends PropsWithChildren {
  error: PasswordValidationError | null
}

const PasswordError: FC<PasswordErrorProps> = ({ error, children }) =>
  error ? (
    <Tooltip
      placement="top"
      variant="tertiary"
      hasArrow
      label={
        <Flex direction="column" gap="1">
          Suggested improvements:
          <UnorderedList gap="1">
            {error.message?.split("|").map((suggestion, index) => (
              <ListItem key={index}>{suggestion.toLowerCase()}</ListItem>
            ))}
          </UnorderedList>
        </Flex>
      }
    >
      <Box cursor="pointer" w="100%">
        {children}
      </Box>
    </Tooltip>
  ) : (
    <>{children}</>
  )

interface PasswordStrengthIndicatorProps {
  password: string
}

const PasswordStrengthIndicator: FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  const indicator = usePasswordStrength(password, async () => {
    // import zxcvbnEnPackage from "@zxcvbn-ts/language-en"
    const zxcvbnEnPackage = await import("@zxcvbn-ts/language-en").then(
      ({ default: x }) => x,
    )
    // import zxcvbnCommonPackage from "@zxcvbn-ts/language-common"
    const zxcvbnCommonPackage = await import("@zxcvbn-ts/language-common").then(
      ({ default: x }) => x,
    )

    const options = {
      dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
      },
      useLevenshteinDistance: true, // recommended
      graphs: zxcvbnCommonPackage.adjacencyGraphs,
      translations: zxcvbnEnPackage.translations,
    }

    zxcvbnOptions.setOptions(options)
  })

  const error: PasswordValidationError | null = useMemo(() => {
    if (indicator && indicator.score >= 3) {
      return null
    }

    const baseSuggestions = [
      "add a symbol",
      "add a number",
      "use a mix of uppercase/lowercase letters",
    ]

    return new PasswordValidationError(0, baseSuggestions.join("|"))
  }, [indicator])

  const label = useMemo(() => {
    if (!indicator) {
      return ""
    }
    if (indicator?.score < 3 && password.length <= 8) {
      return "Password too short"
    }

    return indicator.score >= 4
      ? "Great password!"
      : "Add a symbol or a number to improve"
  }, [indicator, password])

  if (!indicator) {
    return null
  }

  return (
    <PasswordError error={error}>
      <Flex
        justifyItems="flex-start"
        alignItems="center"
        gap="1"
        w="100%"
        mb={3}
      >
        {error ? (
          <AlertIcon color="red.400" />
        ) : (
          <TickCircleIcon color="#02A697" />
        )}
        <H6 color="neutrals.400" fontWeight="normal">
          {error
            ? "Not secure"
            : indicator.score === 3
            ? "Secure"
            : "Very secure"}
          :
        </H6>
        <H6 color="neutrals.400">{label}</H6>
      </Flex>
    </PasswordError>
  )
}

export { PasswordStrengthIndicator }
