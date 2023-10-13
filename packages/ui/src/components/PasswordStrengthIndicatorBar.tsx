import React from "react"
import { Box, Flex, Text } from "@chakra-ui/react"

interface PasswordStrengthIndicatorBarProps {
  progress: number
  error?: string
}

export const PasswordStrengthIndicatorBar: React.FC<
  PasswordStrengthIndicatorBarProps
> = ({ progress, error }) => {
  const colors = ["error.500", "warning.500", "accent.500", "success.500"]
  const strengthLabels = [
    "Very weak password",
    "Weak password",
    "Strong password",
    "Very strong password",
  ]

  return (
    <Box w="full">
      <Flex alignItems="center" mb="2">
        {colors.map((color, index) => (
          <Box
            key={index}
            w="25%"
            h={1}
            bg={progress > index ? color : "neutrals.800"}
            ml={index !== 0 ? "4px" : "0"}
            borderRadius="md"
          />
        ))}
      </Flex>
      <Text>{error ?? strengthLabels[progress - 1]}</Text>
    </Box>
  )
}
