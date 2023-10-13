import {
  Button,
  Center,
  Fade,
  Flex,
  FlexProps,
  SkeletonCircle,
  SkeletonText,
  chakra,
} from "@chakra-ui/react"
import { ComponentProps, FC, ReactNode } from "react"

import { ScrollProps, useNavigateBack } from "../hooks"
import { AbsoluteFlex } from "./Absolute"
import * as icons from "./icons"
import { H6 } from "./Typography"

const { AddIcon, CloseIcon, ArrowLeftIcon } = icons

export const NavigationBarHeight = 14

const Container = chakra(Flex, {
  baseStyle: {
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

export interface NavigationBarProps extends Omit<FlexProps, "title"> {
  isAbsolute?: boolean
  leftButton?: ReactNode
  title?: ReactNode
  rightButton?: ReactNode
  scroll?: ScrollProps
  scrollContent?: ReactNode
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
  const onClick = useNavigateBack()
  return (
    <BarIconButton aria-label="Back" onClick={onClick} {...props}>
      <ArrowLeftIcon />
    </BarIconButton>
  )
}

export const BarCloseButton: FC<ComponentProps<typeof BarIconButton>> = (
  props,
) => {
  const onClick = useNavigateBack()
  return (
    <BarIconButton aria-label="Close" onClick={onClick} {...props}>
      <CloseIcon />
    </BarIconButton>
  )
}

export const BarAddButton: FC<ComponentProps<typeof BarIconButton>> = (
  props,
) => {
  return (
    <BarIconButton aria-label="add" {...props}>
      <AddIcon />
    </BarIconButton>
  )
}

export const NavigationBar: FC<NavigationBarProps> = ({
  isAbsolute,
  leftButton,
  rightButton,
  title,
  scroll,
  children,
  scrollContent,
  ...rest
}) => {
  const scrollTop = scroll?.scrollTop ?? 0
  const isTransparent = scrollTop <= 16
  const showScrollContent = scrollTop > 90
  return (
    <Container
      bg={isTransparent ? "transparent" : "neutrals.700"}
      boxShadow={isTransparent ? "none" : "menu"}
      position={isAbsolute ? "absolute" : "relative"}
      w="full"
      {...rest}
    >
      {title && (
        <TitleContainer px={14}>
          <H6
            w="full"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            textAlign={"center"}
          >
            {title}
          </H6>
        </TitleContainer>
      )}
      <Fade in={!title && showScrollContent}>
        <TitleContainer gap="2">
          {typeof scrollContent === "string" ? (
            <H6>{scrollContent}</H6>
          ) : (
            <>{scrollContent}</>
          )}
        </TitleContainer>
      </Fade>
      {(leftButton || rightButton) && (
        <ButtonsContainer>
          {leftButton}
          {rightButton && <Flex ml={"auto"}>{rightButton}</Flex>}
        </ButtonsContainer>
      )}
      {children}
    </Container>
  )
}

export const NavigationBarSkeleton: FC = () => {
  return (
    <Flex
      alignItems={"center"}
      justifyContent={"space-between"}
      px={3}
      py={2}
      height={NavigationBarHeight}
    >
      <Center w={8} h={8}>
        <SkeletonCircle w={5} h={5} />
      </Center>
      <SkeletonText h={2} w={"33.3%"} noOfLines={1} />
      <Center w={8} h={8}>
        <SkeletonCircle w={5} h={5} />
      </Center>
    </Flex>
  )
}
