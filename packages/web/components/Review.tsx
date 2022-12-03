import { Box, BoxProps, Flex } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

export const Block: FC<PropsWithChildren<BoxProps>> = ({
  children,
  ...rest
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      w="100%"
      borderRadius={"lg"}
      boxShadow={"box"}
      border="1px solid #EDEDED"
      overflow={"hidden"}
      {...rest}
    >
      {children}
    </Box>
  )
}

export const BlockContent: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      px={4}
      py={3}
      w="100%"
    >
      {children}
    </Box>
  )
}

export const BlockError: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      w="100%"
      p={1}
      backgroundColor={"red.500"}
      color="white"
    >
      {children}
    </Flex>
  )
}

export const Row: FC<PropsWithChildren<BoxProps>> = ({ children, ...rest }) => {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      w="100%"
      p={1}
      {...rest}
    >
      {children}
    </Flex>
  )
}
