import { colord } from "colord"
import { FC, useState } from "react"
import Measure from "react-measure"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { IconBar } from "../../components/IconBar"
import { RocketLaunchIcon } from "../../components/Icons/RocketLaunchIcon"
import { deployNewAccount } from "../../services/backgroundAccounts"
import { H2, P } from "../../theme/Typography"
import {
  ConfirmPageProps,
  StickyGroup,
} from "../actions/DeprecatedConfirmScreen"
import { useSelectedAccount } from "./accounts.state"

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
  const selectedAccount = useSelectedAccount()
  const [placeholderHeight, setPlaceholderHeight] = useState(100)

  if (!selectedAccount) {
    return <></>
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

        <LearnMoreLink
          href="https://medium.com/starkware/starknet-alpha-0-10-0-923007290470"
          target="_blank"
          rel="noreferrer"
        >
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
