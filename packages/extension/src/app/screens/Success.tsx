import { FC } from "react"
import styled from "styled-components"

import { A } from "../components/Typography"

import SuccessGif from "../../assets/loading.gif"

const SuccessScreen = styled.div`
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

const SuccessText = styled(A)`
  font-size: 18px;
  line-height: 32px;
`

export const Success: FC<{ txHash: string }> = ({ txHash }) => {
  return (
    <SuccessScreen>
      <Spinner src={SuccessGif} alt="Success" />
      <SuccessText href={`https://voyager.online/tx/${txHash}`} target="_blank">
        Transaction was submitted
      </SuccessText>
    </SuccessScreen>
  )
}
