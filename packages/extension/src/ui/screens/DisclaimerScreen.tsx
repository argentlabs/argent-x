import { FC } from "react"
import styled from "styled-components"

import { P } from "../components/Typography"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"

const SP = styled(P)`
  font-size: 18px;
  line-height: 24px;
`

export const DisclaimerScreen: FC<ConfirmPageProps> = (props) => (
  <ConfirmScreen
    title="Disclaimer"
    confirmButtonText="I understand"
    confirmButtonBgColor="#c12026"
    singleButton
    {...props}
  >
    <SP>
      This is an alpha product for developers. Future versions will likely
      include breaking changes and you may lose access to your accounts. Do not
      store valuable assets.
    </SP>
  </ConfirmScreen>
)
