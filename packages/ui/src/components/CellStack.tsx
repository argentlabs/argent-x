import { Flex, chakra } from "@chakra-ui/react"
import { ComponentProps, FC } from "react"

import { Button } from "./Button"
import { ChevronRightIcon } from "./icons"
import { H6 } from "./Typography"

/** A vertical collection of Cells with standardised spacing */

export const CellStack = chakra(Flex, {
  baseStyle: {
    flexDirection: "column",
    p: 4,
    gap: 2,
  },
})

export const SpacerCell = chakra(Flex, {
  baseStyle: {
    h: 2,
  },
})

export const HeaderCell = chakra(H6, {
  baseStyle: {
    mt: 4,
    mx: 2,
    color: "neutrals.300",
    "&:first-child": {
      mt: 0,
    },
  },
})

export const ButtonCell: FC<ComponentProps<typeof Button>> = ({
  leftIcon,
  rightIcon = <ChevronRightIcon />,
  children,
  ...rest
}) => {
  return (
    <Button
      gap={3}
      p={4}
      h={"initial"}
      textAlign={"left"}
      rounded={"lg"}
      justifyContent={"flex-start"}
      {...rest}
    >
      {leftIcon && <Flex fontSize="base">{leftIcon}</Flex>}
      <H6>{children}</H6>
      {rightIcon && (
        <Flex ml={"auto"} fontSize="base" opacity={0.6}>
          {rightIcon}
        </Flex>
      )}
    </Button>
  )
}
