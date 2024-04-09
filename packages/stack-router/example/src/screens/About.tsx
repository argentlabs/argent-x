import { BarBackButton, CellStack, NavigationContainer } from "@argent/x-ui"

import { ContentBox } from "../ui/ContentBox"

export function About() {
  return (
    <NavigationContainer title={"About"} leftButton={<BarBackButton />}>
      <CellStack>
        <ContentBox>stack-router example</ContentBox>
      </CellStack>
    </NavigationContainer>
  )
}
