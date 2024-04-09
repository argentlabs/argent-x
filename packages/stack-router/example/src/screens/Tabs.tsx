import {
  BarBackButton,
  ButtonCell,
  CellStack,
  HeaderCell,
  NavigationContainer,
  SpacerCell,
} from "@argent/x-ui"
import { Center, Flex } from "@chakra-ui/react"
import { ComponentProps, FC, ReactNode } from "react"
import { Link, NavLink } from "react-router-dom"

const Tab: FC<
  ComponentProps<typeof NavLink> & ComponentProps<typeof Center>
> = (props) => {
  return <Center flex={1} as={NavLink} color={"white"} {...props} />
}

export function TabScreenContainer({ children }: { children: ReactNode }) {
  return (
    <NavigationContainer title={"Tabs"} leftButton={<BarBackButton />}>
      {children}
      <Flex
        position={"absolute"}
        left={0}
        right={0}
        bottom={0}
        height={"96px"}
        bg={"rgba(255, 255, 255, 0.1)"}
        zIndex={123}
      >
        <Tab to="/tabs/1" replace>
          Tab 1
        </Tab>
        <Tab to="/tabs/2" replace>
          Tab 2
        </Tab>
        <Tab to="/tabs/3" replace>
          Tab 3
        </Tab>
      </Flex>
    </NavigationContainer>
  )
}

export function TabScreen1() {
  return (
    <TabScreenContainer>
      <CellStack>
        <HeaderCell>Tab 1</HeaderCell>
        <SpacerCell />
        <ButtonCell as={Link} to="/">
          Push home
        </ButtonCell>
      </CellStack>
    </TabScreenContainer>
  )
}

export function TabScreen2() {
  return (
    <TabScreenContainer>
      <CellStack>
        <HeaderCell>Tab 2</HeaderCell>
        <SpacerCell />
        <ButtonCell as={Link} to="/about">
          About
        </ButtonCell>
      </CellStack>
    </TabScreenContainer>
  )
}

export function TabScreen3() {
  return (
    <TabScreenContainer>
      <CellStack>
        <HeaderCell>Tab 3</HeaderCell>
      </CellStack>
    </TabScreenContainer>
  )
}
