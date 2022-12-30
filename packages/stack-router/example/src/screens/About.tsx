import { BarBackButton, CellStack, NavigationContainer } from "@argent/ui"

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
