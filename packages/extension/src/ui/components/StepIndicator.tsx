import { FC } from "react"
import { Box, BoxProps } from "@chakra-ui/react"

interface StepIndicatorProps extends BoxProps {
  length: number
  currentIndex: number
  filled?: boolean
}

export const StepIndicator: FC<StepIndicatorProps> = ({
  currentIndex,
  length,
  filled = false,
  ...divProps
}) => {
  const primaryColorCondition = (i: number) => {
    if (!filled) {
      return i === currentIndex ? "primary.500" : "surface-elevated"
    }

    return i <= currentIndex ? "primary.500" : "surface-elevated"
  }

  return (
    <Box display="flex" justifyContent="center" gap={2} {...divProps}>
      {Array.from({ length }).map((_, i) => (
        <Box
          key={i}
          w={2}
          h={2}
          borderRadius="50%"
          bg={primaryColorCondition(i)}
        />
      ))}
    </Box>
  )
}
