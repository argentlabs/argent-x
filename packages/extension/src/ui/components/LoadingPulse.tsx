import { Box, BoxProps, keyframes } from "@chakra-ui/react"
import { FC } from "react"

const PulseAnimation = keyframes`
0% {
  opacity: 1;
}
50% {
  opacity: 0.5;
}
100% {
  opacity: 1;
}
`

export interface LoadingPulseProps extends BoxProps {
  isLoading?: boolean
}

export const LoadingPulse: FC<LoadingPulseProps> = ({ isLoading, ...rest }) => {
  return (
    <Box
      animation={isLoading ? `${PulseAnimation} 1.5s infinite` : undefined}
      {...rest}
    />
  )
}
