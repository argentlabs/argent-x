import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
} from "@mui/material"
import { ChangeEventHandler, FC, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import {
  CheckCircleIcon,
  RadioButtonUncheckedIcon,
} from "../../components/Icons/MuiIcons"
import { PrivacyStatementLink } from "../../components/PrivacyStatementLink"
import { routes } from "../../routes"
import {
  usePageTracking,
  useTimeSpentWithSuccessTracking,
} from "../../services/analytics"
import { P3 } from "../../theme/Typography"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"

const StyledPrivacyStatementLink = styled(PrivacyStatementLink)`
  display: flex;
  text-align: right;
  margin-left: auto;
  margin-top: 8px;
`

const StyledFormControlLabel = styled(FormControlLabel)`
  margin: 0 0 8px 0;
  border: 1px solid ${({ theme }) => theme.neutrals600};
  border-radius: 8px;
  padding: 24px 20px 24px 12px;
  gap: 8px;
  &:active {
    transform: scale(0.975);
  }
  transition: transform 100ms ease-in-out;
`

export const OnboardingDisclaimerScreen: FC = () => {
  usePageTracking("disclaimer")
  const { trackSuccess } = useTimeSpentWithSuccessTracking(
    "onboardingStepFinished",
    { stepId: "disclaimer" },
  )
  const navigate = useNavigate()
  const [conditions, setConditions] = useState({
    lossOfFunds: false,
    alphaVersion: false,
  })

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) =>
    setConditions({ ...conditions, [target.name]: target.checked })

  return (
    <OnboardingScreen
      back
      length={4}
      currentIndex={1}
      title="Disclaimer"
      subtitle="StarkNet is in Alpha and may experience technical issues or introduce breaking changes from time to time. Please accept this before continuing."
    >
      <FormControl component="fieldset" variant="standard">
        <FormGroup>
          <StyledFormControlLabel
            control={
              <Checkbox
                checked={conditions.lossOfFunds}
                onChange={handleChange}
                name="lossOfFunds"
                icon={<RadioButtonUncheckedIcon />}
                checkedIcon={<CheckCircleIcon />}
                color="success"
              />
            }
            label={
              <P3>
                I understand that StarkNet may introduce changes that make my
                existing account unusable and force to create new ones.
              </P3>
            }
          />
          <StyledFormControlLabel
            control={
              <Checkbox
                checked={conditions.alphaVersion}
                onChange={handleChange}
                name="alphaVersion"
                icon={<RadioButtonUncheckedIcon />}
                checkedIcon={<CheckCircleIcon />}
                color="success"
              />
            }
            label={
              <P3>
                I understand that StarkNet may experience performance issues and
                my transactions may fail for various reasons.
              </P3>
            }
          />
        </FormGroup>
      </FormControl>
      <StyledPrivacyStatementLink to={routes.onboardingPrivacyStatement()} />
      <div>
        <OnboardingButton
          disabled={!conditions.lossOfFunds || !conditions.alphaVersion}
          onClick={() => {
            trackSuccess()
            navigate(routes.onboardingPassword())
          }}
        >
          Continue
        </OnboardingButton>
      </div>
    </OnboardingScreen>
  )
}
