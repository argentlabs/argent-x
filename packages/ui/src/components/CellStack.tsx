import { ChakraComponent, Flex, PropsOf, chakra } from "@chakra-ui/react"
import { ReactNode } from "react"

import { Button } from "./Button"
import { ChevronRightIcon } from "./icons"
import { H6, P4 } from "./Typography"

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

interface ButtonCellCustomProps {
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  extendedDescription?: ReactNode
  disabled?: boolean
}

type ButtonCellComponent = ChakraComponent<"button", ButtonCellCustomProps>

export type ButtonCellProps = PropsOf<"button"> & ButtonCellCustomProps

export const ButtonCell: ButtonCellComponent = ({
  extendedDescription,
  leftIcon,
  rightIcon = <ChevronRightIcon />,
  disabled,
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
      isDisabled={disabled}
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
        {leftIcon && <Flex fontSize="xl">{leftIcon}</Flex>}
        <H6 overflow={"hidden"} textOverflow={"ellipsis"}>
          {children}
        </H6>
        {rightIcon && (
          <Flex ml={"auto"} fontSize="base" color={"text.secondary"}>
            {rightIcon}
          </Flex>
        )}
      </Flex>
      {extendedDescription && (
        <P4
          pt="3"
          mt="4"
          borderTop="1px"
          borderTopColor="black"
          flex="1"
          w="100%"
          whiteSpace="normal"
          color="neutrals.300"
          fontWeight="normal"
        >
          {extendedDescription}
        </P4>
      )}
    </Button>
  )
}
