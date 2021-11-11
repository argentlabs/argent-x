import { FC } from "react"
import styled from "styled-components"

import LoadingGif from "../../assets/loading.gif"
import { H2 } from "../components/Typography"

const LoadingScreen = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 32px;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100vh;
`

const Spinner = styled.img`
  max-width: 128px;
  max-height: 128px;
`

const LoadingText = styled(H2)`
  font-size: 28px;
  line-height: 32px;
`

export const Loading: FC = () => {
  return (
    <LoadingScreen>
      <Spinner src={LoadingGif} alt="Loading" />
      <LoadingText>Loading...</LoadingText>
    </LoadingScreen>
  )
}
