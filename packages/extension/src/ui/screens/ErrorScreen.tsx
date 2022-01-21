import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { P } from "../components/Typography"
import { useGlobalState } from "../states/global"
import { Pre } from "./ApproveSignScreen"
import { ConfirmScreen } from "./ConfirmScreen"

const SP = styled(P)`
  font-size: 18px;
  line-height: 24px;
`

export const ErrorScreen: FC = () => {
  const navigate = useNavigate()
  const { error } = useGlobalState()

  return (
    <ConfirmScreen
      title="Error"
      confirmButtonText="Back"
      singleButton
      onSubmit={() => navigate(-1)}
    >
      <SP>Something went wrong:</SP>
      <Pre>{error}</Pre>
    </ConfirmScreen>
  )
}
