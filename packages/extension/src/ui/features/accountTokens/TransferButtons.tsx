import { FC } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"

import { getFeeToken } from "../../../shared/token"
import { useAppState } from "../../app.state"
import { IconButton } from "../../components/IconButton"
import { AddIcon, SendIcon } from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"

const Container = styled.div`
  margin: 8px 0 40px 0;
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 36px;
`

const LabeledLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  color: inherit;
  text-decoration: inherit;
  cursor: pointer;

  ${IconButton} {
    background-color: rgba(255, 255, 255, 0.25);

    &:hover {
      background-color: rgba(255, 255, 255, 0.4);
    }
  }

  & > label {
    margin-top: 12px;
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
  }
`

export const TransferButtons: FC = () => {
  const { switcherNetworkId } = useAppState()

  const sendToken = getFeeToken(switcherNetworkId)

  return (
    <Container>
      <LabeledLink to={routes.funding()}>
        <IconButton size={40}>
          <AddIcon fontSize="large" />
        </IconButton>
        <label>Add funds</label>
      </LabeledLink>
      {sendToken && (
        <LabeledLink to={routes.sendScreen()}>
          <IconButton size={40}>
            <SendIcon fontSize="medium" />
          </IconButton>
          <label>Send</label>
        </LabeledLink>
      )}
    </Container>
  )
}
