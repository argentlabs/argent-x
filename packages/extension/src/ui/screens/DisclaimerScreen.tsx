import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { P } from "../components/Typography"
import { routes } from "../routes"
import { understandDisclaimer } from "../utils/disclaimer"
import { ConfirmScreen } from "./ConfirmScreen"

const SP = styled(P)`
  font-size: 18px;
  line-height: 24px;
`

export const DisclaimerScreen: FC = () => {
  const navigate = useNavigate()

  return (
    <ConfirmScreen
      title="Disclaimer"
      confirmButtonText="I understand"
      confirmButtonBgColor="#c12026"
      singleButton
      onSubmit={() => {
        understandDisclaimer()
        navigate(routes.welcome)
      }}
    >
      <SP>
        This is an alpha product for developers. Future versions will likely
        include breaking changes and you may lose access to your accounts. Do
        not store valuable assets.
      </SP>
    </ConfirmScreen>
  )
}
