import { FC } from "react"
import styled from "styled-components"

import { Greetings } from "../components/Greetings"
import { Spinner } from "../components/Spinner"

const LoadingScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 32px;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100vh;
`

const loadingTexts = [
  "Loading...",
  "Please wait…",
  "Patience is a virtue…",
  "Almost there…",
]

export const LoadingScreen: FC = () => {
  return (
    <LoadingScreenWrapper>
      <Spinner size={92} />
      <Greetings greetings={loadingTexts} />
    </LoadingScreenWrapper>
  )
}
