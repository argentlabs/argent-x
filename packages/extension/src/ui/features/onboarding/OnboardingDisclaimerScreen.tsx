import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
} from "@mui/material"
import { ChangeEventHandler, FC, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled, { useTheme } from "styled-components"

import {
  CheckCircleIcon,
  RadioButtonUncheckedIcon,
} from "../../components/Icons/MuiIcons"
import { PrivacyStatement } from "../../components/PrivacyStatement"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { P } from "../../theme/Typography"
import { ConfirmScreen } from "../actions/ConfirmScreen"

const SP = styled(P)`
  font-family: "Barlow", sans-serif; // explicit, as applied to MUI
  font-size: 16px;
  line-height: 20px;
`

const StyledPrivacyStatement = styled(PrivacyStatement)`
  display: block;
  text-align: center;
`

export const OnboardingDisclaimerScreen: FC = () => {
  usePageTracking("disclaimer")
  const navigate = useNavigate()
  const [conditions, setConditions] = useState({
    lossOfFunds: false,
    alphaVersion: false,
  })

  const theme = useTheme()

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) =>
    setConditions({ ...conditions, [target.name]: target.checked })

  return (
    <ConfirmScreen
      title="Disclaimer"
      confirmButtonText="Continue"
      confirmButtonBackgroundColor={theme.red1}
      confirmButtonDisabled={
        !conditions.lossOfFunds || !conditions.alphaVersion
      }
      singleButton
      onSubmit={() => navigate(routes.onboardingPassword())}
      footer={<StyledPrivacyStatement />}
    >
      <SP>
        StarkNet is in Alpha and may experience technical issues or introduce
        breaking changes from time to time. Please accept this before
        continuing.
      </SP>
      <FormControl component="fieldset" variant="standard">
        <FormGroup>
          <FormControlLabel
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
              <SP>
                I understand that StarkNet may introduce changes that make my
                existing account unusable and force to create new ones.
              </SP>
            }
            style={{ marginTop: 30 }}
          />
          <FormControlLabel
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
              <SP>
                I understand that StarkNet may experience performance issues and
                my transactions may fail for various reasons.
              </SP>
            }
            style={{ marginTop: 30 }}
          />
        </FormGroup>
      </FormControl>
    </ConfirmScreen>
  )
}
