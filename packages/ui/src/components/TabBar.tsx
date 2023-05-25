import {
  Center,
  Circle,
  ComponentWithAs,
  Flex,
  PropsOf,
  chakra,
} from "@chakra-ui/react"
import { ReactNode } from "react"
import { NavLink } from "react-router-dom"

export const TabBarHeight = 16

export const TabBar = chakra(Flex, {
  baseStyle: {
    top: "initial",
    bottom: 0,
    height: TabBarHeight,
    color: "neutrals.600",
    backgroundColor: "bg",
    borderTop: "1px solid",
    borderTopColor: "border",
    boxShadow: "menu",
  },
})

export const TabContainer = chakra(Center, {
  baseStyle: {
    position: "relative",
    display: "flex",
    flex: "1",
    alignItems: "center",
    justifyContent: "center",
    color: "neutrals.400",
    "&.active": {
      pointerEvents: "none",
    },
  },
})

export const TabIconContainer = chakra(Circle, {
  baseStyle: {
    fontSize: "2xl",
    transitionProperty: "common",
    transitionDuration: "fast",
    ".active &": {
      color: "white",
      backgroundColor: "neutrals.600",
    },
    _groupHover: {
      color: "neutrals.100",
      backgroundColor: "neutrals.700",
      ".active &": {
        backgroundColor: "red",
      },
    },
  },
})

export const TabBadge = chakra(Circle, {
  baseStyle: {
    position: "absolute",
    left: "50%",
    top: "50%",
    backgroundColor: "skyBlue.500",
    transform:
      "translate(calc(var(--chakra-sizes-5)*-1),calc(var(--chakra-sizes-5)*-1))",
  },
})

export interface TabCustomProps {
  icon: ReactNode
  label?: string
  badgeLabel?: string | number
  badgeDescription?: string
}

type TabComponent = ComponentWithAs<"div", TabCustomProps>
export type TabProps = PropsOf<TabComponent>

export const Tab: TabComponent = ({
  icon,
  label,
  badgeLabel,
  badgeDescription,
  as = NavLink,
  ...rest
}) => {
  const showBadgeLabel = Number(badgeLabel) > 0
  return (
    <TabContainer aria-label={label} role="group" as={as} {...rest}>
      {showBadgeLabel && <TabBadge aria-label={badgeDescription} size={2} />}
      <TabIconContainer size={10}>{icon}</TabIconContainer>
    </TabContainer>
  )
}
