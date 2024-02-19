import { L2 } from "@argent/ui"
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
      py={2}
      _dark={{
        backgroundColor: "neutrals.900",
        borderColor: "neutrals.500",
        boxShadow: "menu",
      }}
      {...props}
    />
  )
}

export const FeeEstimationBoxWithDeploy: FC<PropsWithChildren> = ({
  children,
}) => (
  <Flex
    borderRadius="xl"
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
    <Flex px={3} py={2}>
      {children}
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

interface FeeEstimationBoxWithInsufficientFundsProps extends PropsWithChildren {
  userClickedAddFunds: boolean
}

export const FeeEstimationBoxWithInsufficientFunds: FC<
  FeeEstimationBoxWithInsufficientFundsProps
> = ({ children, userClickedAddFunds }) => {
  return (
    <Flex
      borderRadius="xl"
      backgroundColor="white"
      border="1px"
      borderColor="error.500"
      flexDir={"column"}
      _dark={{
        backgroundColor: "neutrals.900",
        borderColor: "redText",
        boxShadow: "menu",
      }}
    >
      <Flex px={3} py={2}>
        {children}
      </Flex>
      <Flex
        backgroundColor="errorExtraDark"
        justifyContent="center"
        alignItems="center"
        borderBottomRadius="xl"
        p="1"
      >
        <L2 color="errorText">
          {userClickedAddFunds
            ? "Waiting for funds..."
            : "Insufficient funds to pay fee"}
        </L2>
      </Flex>
    </Flex>
  )
}
