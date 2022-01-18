import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { P } from "../components/Typography"
import { routes } from "../routes"
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
        localStorage.setItem("UNDERSTOOD_DISCLAIMER", JSON.stringify(true))
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
