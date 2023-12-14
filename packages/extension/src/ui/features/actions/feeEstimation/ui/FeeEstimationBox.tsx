import { Flex } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

export const FeeEstimationBox: FC<PropsWithChildren> = (props) => {
  return (
    <Flex
      borderRadius="lg"
      backgroundColor="white"
      border="1px"
      borderColor="transparent"
      px={3}
      py={2.5}
      _dark={{
        backgroundColor: "neutrals.900",
        borderColor: "neutrals.500",
        boxShadow: "menu",
      }}
      {...props}
    />
  )
}

export const FeeEstimationBoxWithDeploy: FC<PropsWithChildren> = (props) => (
  <Flex
    borderRadius="lg"
    backgroundColor="white"
    border="1px"
    borderColor="transparent"
    flexDir={"column"}
    _dark={{
      backgroundColor: "neutrals.900",
      borderColor: "neutrals.500",
      boxShadow: "menu",
    }}
  >
    <Flex px={3} py={2.5}>
      {props.children}
    </Flex>
    <Flex
      backgroundColor="neutrals.700"
      justifyContent="center"
      alignItems="center"
      borderBottomRadius="xl"
      p="1"
    >
      Includes one-time activation fee
    </Flex>
  </Flex>
)
