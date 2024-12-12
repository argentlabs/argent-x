import {
  BarIconButton,
  ButtonCell,
  CellStack,
  icons,
  NavigationContainer,
  SpacerCell,
} from "@argent/x-ui"
import { useCallback } from "react"
import { Link } from "react-router-dom"

const { ExpandIcon, SettingsSecondaryIcon } = icons

export function Home() {
  const onOpenWindow = useCallback(() => {
    window.open(
      window.location.href,
      "_blank",
      "scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=400,height=600,left=100,top=100",
    )
  }, [])
  return (
    <NavigationContainer
      title={"Home"}
      rightButton={
        <BarIconButton as={Link} to={"/settings"}>
          <SettingsSecondaryIcon />
        </BarIconButton>
      }
    >
      <CellStack>
        <ButtonCell as={Link} to="/tokens/a">
          Token A
        </ButtonCell>
        <ButtonCell as={Link} to="/tokens/b">
          Token B
        </ButtonCell>
        <ButtonCell as={Link} to="/tokens/c">
          Token C
        </ButtonCell>
        <SpacerCell />
        <ButtonCell as={Link} to="/activity">
          Activities
        </ButtonCell>
        <ButtonCell as={Link} to="/activity/1">
          Activity
        </ButtonCell>
        <ButtonCell as={Link} to="/activity/1" replace>
          Activity (replace)
        </ButtonCell>
        <SpacerCell />
        <ButtonCell as={Link} to="/accounts/1">
          Account
        </ButtonCell>
        <ButtonCell as={Link} to="/tabs/1">
          Tabs
        </ButtonCell>
        <ButtonCell as={Link} to="/about">
          About
        </ButtonCell>
        <ButtonCell as={Link} to="/picker">
          Picker
        </ButtonCell>
        <SpacerCell />
        <ButtonCell as={Link} to="/lock-screen">
          Lock
        </ButtonCell>
        <SpacerCell />
        <ButtonCell onClick={onOpenWindow} rightIcon={<ExpandIcon />}>
          Open popup
        </ButtonCell>
      </CellStack>
    </NavigationContainer>
  )
}
