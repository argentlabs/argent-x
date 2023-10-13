import { Flex } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

export const FeeEstimationBox: FC<PropsWithChildren> = (props) => {
  return (
    <Flex
      borderRadius="xl"
      backgroundColor="white"
      border="1px"
      borderColor="transparent"
      px={3}
      py={3.5}
      _dark={{
        backgroundColor: "neutrals.900",
        borderColor: "neutrals.500",
        boxShadow: "menu",
      }}
      {...props}
    />
  )
}
