import { ChakraComponent, Flex, chakra } from "@chakra-ui/react"
import { ReactNode } from "react"

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
    "&:first-of-type": {
      mt: 0,
    },
  },
})

export type ButtonCellProps = ChakraComponent<
  "button",
  {
    leftIcon?: ReactNode
    rightIcon?: ReactNode
    extendedDescription?: ReactNode
  }
>

export const ButtonCell: ButtonCellProps = ({
  extendedDescription,
  leftIcon,
  rightIcon = <ChevronRightIcon />,
  children,
  ...rest
}) => {
  return (
    <Button
      h={"initial"}
      rounded={"lg"}
      flexDir={"column"}
      p={4}
      justifyContent={"flex-start"}
      textAlign={"left"}
      {...rest}
    >
      <Flex
        w="100%"
        gap={3}
        flex="1"
        justifyContent={"flex-start"}
        alignItems={"center"}
        textAlign={"left"}
      >
        {leftIcon && <Flex fontSize="base">{leftIcon}</Flex>}
        <H6>{children}</H6>
        {rightIcon && (
          <Flex ml={"auto"} fontSize="base">
            {rightIcon}
          </Flex>
        )}
      </Flex>
      {extendedDescription && (
        <Flex
          pt="3"
          mt="4"
          borderTop="1px"
          borderTopColor="black"
          flex="1"
          w="100%"
          whiteSpace="normal"
        >
          {extendedDescription}
        </Flex>
      )}
    </Button>
  )
}
