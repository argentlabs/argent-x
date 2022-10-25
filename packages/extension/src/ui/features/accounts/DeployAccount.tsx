import { colord } from "colord"
import { FC, useState } from "react"
import Measure from "react-measure"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { useSWRConfig } from "swr"

import { accountDeployAction } from "../../../background/accounDeployAction"
import { Button, ButtonGroupVertical } from "../../components/Button"
import { IconBar } from "../../components/IconBar"
import { RocketLaunchIcon } from "../../components/Icons/RocketLaunchIcon"
import { StarknetIcon } from "../../components/Icons/StarknetIcon"
import { routes } from "../../routes"
import {
  deployNewAccount,
  upgradeAccount,
} from "../../services/backgroundAccounts"
import { rejectAction } from "../../services/backgroundActions"
import { H2, P } from "../../theme/Typography"
import { useActions } from "../actions/actions.state"
import { ConfirmPageProps, StickyGroup } from "../actions/ConfirmScreen"
import { useShouldShowNetworkUpgradeMessage } from "../networks/showNetworkUpgrade"
import { recover } from "../recovery/recovery.service"
import { useSelectedAccountStore } from "./accounts.state"

const StyledIconBar = styled(IconBar)`
  background: url("../../../assets/StarknetStars.png");
  background-color: #18185f;
  padding-bottom: 45px;
`

const StyledP = styled(P)`
  margin-bottom: 16px;
  line-height: 21px;
`

const StyledPBold = styled(StyledP)`
  font-weight: 600;
`

const LearnMoreLink = styled.a`
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;

  color: ${({ theme }) => theme.red3};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

const HeaderText = styled(H2)`
  font-weight: 700;
  font-size: 28px;
  line-height: 34px;
`

const Container = styled.div`
  padding: 72px 32px 32px;
`

const Placeholder = styled.div`
  width: 100%;
  margin-top: 8px;
`

const PrimaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.white};
  color: black;
  font-weight: 600;

  &:hover {
    background-color: ${({ theme }) =>
      colord(theme.white).darken(0.1).toRgbString()};
  }
`

const IconBarContainer = styled.div`
  position: relative;
`
const StyledStarknetIcon = styled(RocketLaunchIcon)`
  position: absolute;
  top: 60%;
  left: 32px;
`

type DeployAccountScreenProps = Omit<ConfirmPageProps, "onSubmit">

export const DeployAccountScreen: FC<DeployAccountScreenProps> = ({
  onReject,
  ...props
}) => {
  const navigate = useNavigate()
  const [action] = useActions()
  const { selectedAccount } = useSelectedAccountStore()
  const [placeholderHeight, setPlaceholderHeight] = useState(100)

  if (!selectedAccount) {
    return <></>
  }

  const rejectSignAction = async () => {
    if (action && action.type === "SIGN") {
      await rejectAction(action)
    }
  }

  return (
    <div {...props}>
      <IconBarContainer>
        <StyledIconBar close onClick={onReject} />
        <StyledStarknetIcon />
      </IconBarContainer>
      <Container>
        <HeaderText>Your wallet needs to be activated</HeaderText>
        <StyledP>
          In order to sign this transaction you need to first activate your
          account on StarkNet
        </StyledP>

        <StyledPBold>
          Activating an account involves a fee. This is not controlled by
          ArgentX
        </StyledPBold>

        <LearnMoreLink href="" target="_blank" rel="noreferrer">
          Learn more about this change
        </LearnMoreLink>

        <Placeholder style={{ height: placeholderHeight }}>
          <Measure
            bounds
            onResize={(contentRect) => {
              const { height = 100 } = contentRect.bounds || {}
              setPlaceholderHeight(height)
            }}
          >
            {({ measureRef }) => (
              <StickyGroup ref={measureRef}>
                <PrimaryButton
                  onClick={async () => {
                    // setTimeout(() => {
                    //   onReject && rejectSignAction()
                    // }, 1000)
                    await deployNewAccount(selectedAccount)
                  }}
                  type="button"
                >
                  Activate Account
                </PrimaryButton>
              </StickyGroup>
            )}
          </Measure>
        </Placeholder>
      </Container>
    </div>
  )
}
