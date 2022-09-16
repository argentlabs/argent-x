import styled from "styled-components"

import { PressableButton } from "../../../components/Button"

export const OnboardingButton = styled(PressableButton).attrs(() => ({
  variant: "primary",
}))`
  min-width: 200px;
`
