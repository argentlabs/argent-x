import { Flex } from "@chakra-ui/react"
import { ComponentProps, FC, PropsWithChildren } from "react"

import { Button } from "./Button"
import { ChevronRightIcon } from "./icons"
import { H6 } from "./Typography"

/** A vertical collection of Cells with spacing */

export const CellStack: FC<PropsWithChildren> = (props) => {
  return <Flex p={4} gap={2} direction="column" {...props} />
}

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
        <Flex ml={"auto"} fontSize="base">
          {rightIcon}
        </Flex>
      )}
    </Button>
  )
}
