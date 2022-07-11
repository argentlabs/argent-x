import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { P } from "../../theme/Typography"
import { Pre } from "./ApproveSignatureScreen"
import { ConfirmScreen } from "./ConfirmScreen"

const SP = styled(P)`
  font-size: 18px;
  line-height: 24px;
`

const WrappingPre = styled(Pre)`
  white-space: pre-wrap;
`

export const ErrorScreen: FC = () => {
  const navigate = useNavigate()
  const { error } = useAppState()

  const message = error
    ? error.replace(/^(error:\s*)+/gi, "")
    : "No error message available"

  return (
    <ConfirmScreen
      title="Error"
      confirmButtonText="Back"
      singleButton
      onSubmit={() => navigate(-1)}
    >
      <SP>Something went wrong:</SP>
      <WrappingPre>{message}</WrappingPre>
    </ConfirmScreen>
  )
}
