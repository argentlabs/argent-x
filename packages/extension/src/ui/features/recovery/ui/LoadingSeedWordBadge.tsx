import { Box } from "@chakra-ui/react"
import { keyframes } from "@chakra-ui/react"
import { FC } from "react"

const pulseKeyframe = keyframes`
0% {
  opacity: 1;
}
100% {
  opacity: 0.2;
}
`

interface LoadingSeedWordBadgeProps {
  animationDelay?: number
}

export const LoadingSeedWordBadge: FC<
  LoadingSeedWordBadgeProps & { animationDelay: number }
> = ({ animationDelay = 0, ...props }) => {
  return (
    <Box
      height="26px"
      width="100%"
      borderRadius="20px"
      backgroundColor="rgba(255, 255, 255, 0.1)"
      animation={`${pulseKeyframe} 1s alternate infinite ${animationDelay}ms`}
      {...props}
    />
  )
}
