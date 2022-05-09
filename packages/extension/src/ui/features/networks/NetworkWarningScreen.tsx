import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { H2, P } from "../../components/Typography"
import { routes } from "../../routes"
import { ConfirmScreen } from "../../screens/ConfirmScreen"
import { CongestionIcon } from "./CongestionIcon"
import { useNeedsToShowNetworkStatusWarning } from "./seenNetworkStatusWarning.state"

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  margin-top: 20px;

  > ${H2} {
    margin: 40px 0 16px;
  }
`

const CenterP = styled(P)`
  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
  text-align: center;
`

export const NetworkWarningScreen: FC = () => {
  const navigate = useNavigate()
  const [, updateNeedsToShowNetworkStatusWarning] =
    useNeedsToShowNetworkStatusWarning()

  return (
    <ConfirmScreen
      confirmButtonText="I understand"
      singleButton
      confirmButtonBackgroundColor="#C12026"
      onSubmit={() => {
        updateNeedsToShowNetworkStatusWarning()
        navigate(routes.accounts())
      }}
    >
      <Wrapper>
        <CongestionIcon />
        <H2>Network issues</H2>
        <CenterP>
          StarkNet is in Alpha and is experiencing degraded network performance.
          Your transactions may fail.
        </CenterP>
      </Wrapper>
    </ConfirmScreen>
  )
}
