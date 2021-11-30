import { FC } from "react"
import styled from "styled-components"

import { Greetings } from "../components/Greetings"
import { Spinner } from "../components/Spinner"
import { useProgress } from "../states/progress"

const LoadingScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 32px;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100vh;
`

const loadingTexts = ["Please wait…", "Patience is a virtue…", "Almost there…"]

export const LoadingScreen: FC = () => {
  const loadingText = useProgress((x) => x.text)

  return (
    <LoadingScreenWrapper>
      <Spinner size={92} />
      <Greetings greetings={[loadingText || "Loading...", ...loadingTexts]}>
        {loadingText || "Loading..."}
      </Greetings>
    </LoadingScreenWrapper>
  )
}
