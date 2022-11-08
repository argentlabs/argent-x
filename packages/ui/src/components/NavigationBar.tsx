import { Button, Flex, chakra } from "@chakra-ui/react"
import { ComponentProps, FC, PropsWithChildren, ReactNode } from "react"

import { IScroll } from "../hooks"
import { AbsoluteFlex } from "./Absolute"
import * as icons from "./icons"
import { H6 } from "./Typography"

const { CloseIcon, ChevronLeftIcon } = icons

export const NavigationBarHeight = 14

const Container = chakra(Flex, {
  baseStyle: {
    position: "relative",
    alignItems: "center",
    bottom: "initial",
    h: NavigationBarHeight,
    px: 3,
    py: 2,
    transitionProperty: "background",
    transitionDuration: "fast",
    flexShrink: 0,
    zIndex: 1 /** shadow should appear over siblings regardless of DOM order */,
  },
})

const ButtonsContainer = chakra(AbsoluteFlex, {
  baseStyle: {
    alignItems: "center",
    justifyContent: "space-between",
    px: 3,
    py: 2,
  },
})

const TitleContainer = chakra(AbsoluteFlex, {
  baseStyle: {
    alignItems: "center",
    justifyContent: "center",
  },
})

export interface NavigationBarProps extends PropsWithChildren {
  leftButton?: ReactNode
  title?: ReactNode
  rightButton?: ReactNode
  scroll?: IScroll
}

export const BarIconButton: FC<ComponentProps<typeof Button>> = ({
  children,
  ...rest
}) => (
  <Button
    color="neutrals.200"
    colorScheme="transparent"
    padding="1.5"
    fontSize="xl"
    size="auto"
    rounded="full"
    {...rest}
  >
    {children}
  </Button>
)

export const BarBackButton: FC<ComponentProps<typeof BarIconButton>> = (
  props,
) => {
  return (
    <BarIconButton {...props}>
      <ChevronLeftIcon />
    </BarIconButton>
  )
}

export const BarCloseButton: FC<ComponentProps<typeof BarIconButton>> = (
  props,
) => {
  return (
    <BarIconButton {...props}>
      <CloseIcon />
    </BarIconButton>
  )
}
export const NavigationBar: FC<NavigationBarProps> = ({
  leftButton,
  rightButton,
  title,
  scroll,
  children,
}) => {
  const scrollTop = scroll?.scrollTop ?? 0
  const isTransparent = scrollTop <= 16
  return (
    <Container
      bg={isTransparent ? "transparent" : "neutrals.700"}
      boxShadow={isTransparent ? "none" : "menu"}
    >
      {title && (
        <TitleContainer>
          <H6>{title}</H6>
        </TitleContainer>
      )}
      {(leftButton || rightButton) && (
        <ButtonsContainer>
          {leftButton}
          {rightButton}
        </ButtonsContainer>
      )}
      {children}
    </Container>
  )
}
