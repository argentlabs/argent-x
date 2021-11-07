import { FC } from "react"
import styled from "styled-components"
import { H1, P } from "../components/Typography"
import LogoSvg from "../../assets/logo.svg"
import { Button, ButtonGroup } from "../components/Button"
import { StickyArgentFooter } from "../components/StickyArgentFooter"

const WelcomeScreen = styled.div`
  padding: 70px 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > ${P} {
    text-align: center;
  }

  > ${ButtonGroup} {
    margin-top: 80px;
  }
`

interface WelcomePageProps {
  onPrimaryBtnClick?: () => void
  onSecondaryBtnClick?: () => void
}

export const Welcome: FC<WelcomePageProps> = ({
  onPrimaryBtnClick,
  onSecondaryBtnClick,
}) => {
  return (
    <WelcomeScreen>
      <LogoSvg />
      <H1>Get started</H1>
      <P>Enjoy the security of Ethereum with the scale of Starknet</P>
      <ButtonGroup>
        <Button onClick={onPrimaryBtnClick}>New account</Button>
        <Button onClick={onSecondaryBtnClick}>Restore account</Button>
      </ButtonGroup>
      <StickyArgentFooter />
    </WelcomeScreen>
  )
}
