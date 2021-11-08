import { FC, useState, useEffect } from "react"
import styled, { keyframes } from "styled-components"
import { H2 } from "./Typography"

const greetings = [
  "gm!",
  "Hello!",
  "Guten Tag!",
  "Привет!",
  "gm, ser!",
  "hi fren",
]

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

const useCarusel = (length: number, delay = 3000): number => {
  const [index, setState] = useState(0)

  useEffect(() => {
    const pid = setInterval(() => {
      setState((lIndex) => (lIndex + 1) % length)
    }, delay)
    return () => {
      clearInterval(pid)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, delay])

  return index
}

export const Greetings: FC = ({ ...props }) => {
  const index = useCarusel(greetings.length)
  return (
    <GreetingsWrapper {...props}>
      <FadeInAndOutText key={index}>{greetings[index]}</FadeInAndOutText>
    </GreetingsWrapper>
  )
}
