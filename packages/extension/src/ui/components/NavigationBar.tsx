import { AbsoluteFlex, H6, IScroll, icons } from "@argent/ui"
import { Button, chakra } from "@chakra-ui/react"
import { ComponentProps, FC, PropsWithChildren, ReactNode } from "react"
import { useNavigate } from "react-router-dom"

import { navigateBack } from "../../../e2e/steps/navigateBack"

const { CloseIcon } = icons

export const NavigationBarHeight = 14

const Container = chakra(AbsoluteFlex, {
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

export interface BarCloseButtonProps {
  onClick?: () => void
}

export const BarCloseButton: FC<BarCloseButtonProps> = ({
  onClick: onClickProp,
}) => {
  const navigate = useNavigate()
  const onClick = onClickProp ? onClickProp : () => navigate(-1)
  return (
    <BarIconButton onClick={onClick}>
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
