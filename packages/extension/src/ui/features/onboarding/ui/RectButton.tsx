import { colord } from "colord"
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

export const IconContainer = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const CreateWalletRectButtonIcon = styled(IconContainer)`
  background-color: ${({ theme }) => theme.primary};
`

export const RestoreWalletRectButtonIcon = styled(IconContainer)`
  background-color: ${({ theme }) =>
    colord(theme.neutrals600).alpha(0.5).toRgbString()};
`

export const TwitterRectButtonIcon = styled(IconContainer)`
  background-color: #1da1f2;
`

export const DiscordRectButtonIcon = styled(IconContainer)`
  background-color: #5865f2;
`
