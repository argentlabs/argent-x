import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { PrivacyStatementText } from "../../components/PrivacyStatementText"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"

const PrivacyStatementTextContainer = styled.div`
  margin-bottom: 32px;
`

export const OnboardingPrivacyStatementScreen: FC = () => {
  const naviagte = useNavigate()
  return (
    <OnboardingScreen back title="Privacy statement">
      <PrivacyStatementTextContainer>
        <PrivacyStatementText />
      </PrivacyStatementTextContainer>
      <OnboardingButton onClick={() => naviagte(-1)}>Back</OnboardingButton>
    </OnboardingScreen>
  )
}
