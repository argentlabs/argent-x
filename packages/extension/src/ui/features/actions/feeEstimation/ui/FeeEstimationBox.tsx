import { Flex } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

export const FeeEstimationBox: FC<PropsWithChildren> = (props) => {
  return (
    <Flex
      borderRadius="xl"
      backgroundColor="neutrals.900"
      border="1px"
      borderColor="neutrals.500"
      boxShadow="menu"
      px={3}
      py={3.5}
      {...props}
    />
  )
}
