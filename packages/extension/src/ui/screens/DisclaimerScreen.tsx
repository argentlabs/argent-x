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
} from "../components/Icons/MuiIcons"
import { P } from "../components/Typography"
import { routes } from "../routes"
import { ConfirmScreen } from "./ConfirmScreen"

const SP = styled(P)`
  font-size: 18px;
  line-height: 24px;
`

export const DisclaimerScreen: FC = () => {
  const navigate = useNavigate()
  const [conditions, setConditions] = useState({
    lossOfFunds: false,
    alphaVersion: false,
  })

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) =>
    setConditions({ ...conditions, [target.name]: target.checked })

  return (
    <ConfirmScreen
      title="Disclaimer"
      confirmButtonText="Continue"
      confirmButtonBackgroundColor="#c12026"
      confirmButtonDisabled={
        !conditions.lossOfFunds || !conditions.alphaVersion
      }
      singleButton
      onSubmit={() => navigate(routes.newWallet())}
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
            label="I understand that StarkNet may introduce changes that make my existing account unusable and force to create new ones."
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
            label="I understand that StarkNet may experience performance issues and my transactions may fail for various reasons."
            style={{ marginTop: 30 }}
          />
        </FormGroup>
      </FormControl>
    </ConfirmScreen>
  )
}
