import { Center } from "@chakra-ui/react"
import { BoxProps } from "@mui/material"
import { FC } from "react"

export const IconWrapper: FC<BoxProps> = ({
  children,
  ...rest
}: {
  children?: React.ReactNode
}) => {
  return (
    <Center
      w="14"
      h="14"
      background="neutrals.700"
      borderRadius="2xl"
      boxShadow="menu"
      {...rest}
    >
      {children}
    </Center>
  )
}
