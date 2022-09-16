import styled from "styled-components"

import { PressableButton } from "../../../components/Button"

export const RectButton = styled(PressableButton).attrs(() => ({
  variant: "neutrals800",
}))`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  padding: 36px 18px;
`
