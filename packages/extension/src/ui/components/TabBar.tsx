import { AbsoluteFlex } from "@argent/ui"
import { Center, Circle, chakra } from "@chakra-ui/react"
import { ComponentProps, FC, ReactNode } from "react"
import { NavLink } from "react-router-dom"

export const TabBarHeight = 16

export const TabBar = chakra(AbsoluteFlex, {
  baseStyle: {
    top: "initial",
    bottom: 0,
    height: TabBarHeight,
    color: "neutrals.600",
    backgroundColor: "neutrals.900",
    borderTop: "1px solid",
    borderTopColor: "neutrals.700",
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

export interface TabProps extends ComponentProps<typeof NavLink> {
  icon: ReactNode
  label?: string
  badgeLabel?: string | number
}

export const Tab: FC<TabProps> = ({ icon, label, badgeLabel, ...rest }) => {
  const showBadgeLabel = Number(badgeLabel) > 0
  return (
    <TabContainer aria-label={label} as={NavLink} role="group" {...rest}>
      {showBadgeLabel && <TabBadge size={2} />}
      <TabIconContainer size={10}>{icon}</TabIconContainer>
    </TabContainer>
  )
}
