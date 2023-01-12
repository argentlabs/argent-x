import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { coerceErrorToString } from "../../../shared/utils/error"
import { useAppState } from "../../app.state"
import { P } from "../../theme/Typography"
import { Pre } from "./ApproveSignatureScreen"
import { DeprecatedConfirmScreen } from "./DeprecatedConfirmScreen"

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
  const displayError = coerceErrorToString(error)

  const message =
    error && error.replace ? error.replace(/^(error:\s*)+/gi, "") : displayError

  return (
    <DeprecatedConfirmScreen
      title="Error"
      confirmButtonText="Back"
      singleButton
      onSubmit={() => navigate(-1)}
    >
      <SP>Something went wrong:</SP>
      <WrappingPre>{message}</WrappingPre>
    </DeprecatedConfirmScreen>
  )
}
