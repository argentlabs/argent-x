import type { FC, PropsWithChildren } from "react"
import { useEffect, useState } from "react"
import { Box, keyframes } from "@chakra-ui/react"
import { P2 } from "@argent/x-ui"

const fadeInAndOut = keyframes`
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`

const FadeInAndOutText: FC<{ duration?: string } & PropsWithChildren> = ({
  duration = "3s",
  ...props
}) => {
  return (
    <P2
      animation={`${fadeInAndOut} ${duration} ease-in-out forwards`}
      color="neutrals.300"
      mt={6}
      {...props}
    />
  )
}

const useCarousel = (greetings: string[], delay = 3000): number => {
  const [index, setState] = useState(0)
  const length = greetings.length

  useEffect(() => {
    setState(0)
    const pid = setInterval(() => {
      setState((lIndex) => (lIndex + 1) % length)
    }, delay)
    return () => {
      clearInterval(pid)
    }
  }, [greetings, delay, length])

  return index
}

interface GreetingsProps {
  greetings: string[]
}

export const Greetings: FC<GreetingsProps> = ({ greetings, ...props }) => {
  const index = useCarousel(greetings)
  return (
    <Box position="relative" mx="4" my="0" h={10} w="100%" {...props}>
      <FadeInAndOutText key={index}>{greetings[index]}</FadeInAndOutText>
    </Box>
  )
}
