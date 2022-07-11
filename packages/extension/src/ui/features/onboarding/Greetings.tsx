import { FC, useEffect, useState } from "react"
import styled, { keyframes } from "styled-components"

import { H2 } from "../../theme/Typography"

export const GreetingsWrapper = styled.div`
  position: relative;

  margin: 16px 0px;
  height: 41px;
  width: 100%;
`

const Text = styled(H2)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`

const FadeInAndOut = keyframes`
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
const FadeInAndOutText = styled(Text)`
  animation: ${FadeInAndOut} 3s ease-in-out forwards;
`

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
    <GreetingsWrapper {...props}>
      <FadeInAndOutText key={index}>{greetings[index]}</FadeInAndOutText>
    </GreetingsWrapper>
  )
}
