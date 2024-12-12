import type { FC } from "react"
import type { FlexProps } from "@chakra-ui/react"
import { Flex, Circle } from "@chakra-ui/react"

interface StepIndicatorProps extends FlexProps {
  length: number
  currentIndex: number
  filled?: boolean
}

export const StepIndicator: FC<StepIndicatorProps> = ({
  currentIndex,
  length,
  filled = false,
  ...rest
}) => {
  const primaryColorCondition = (i: number) => {
    if (!filled) {
      return i === currentIndex ? "primary.500" : "surface-elevated-hover"
    }

    return i <= currentIndex ? "primary.500" : "surface-elevated-hover"
  }

  return (
    <Flex display="flex" gap={2} {...rest}>
      {Array.from({ length }).map((_, i) => (
        <Circle key={i} size={2} bg={primaryColorCondition(i)} />
      ))}
    </Flex>
  )
}
