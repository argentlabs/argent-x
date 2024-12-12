import { L2Bold } from "@argent/x-ui"
import type { FlexProps } from "@chakra-ui/react"
import { Flex, SkeletonText } from "@chakra-ui/react"
import type { FC, PropsWithChildren } from "react"

export const FeeEstimationBoxSkeleton: FC<FlexProps> = (props) => {
  return (
    <FeeEstimationBox minHeight={12} alignItems="center" {...props}>
      <SkeletonText noOfLines={1} w="33.3%" />
    </FeeEstimationBox>
  )
}

export const FeeEstimationBox: FC<FlexProps> = (props) => {
  return (
    <Flex
      borderRadius="xl"
      backgroundColor="white"
      border="1px"
      borderColor="transparent"
      pl={3}
      pr={2}
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
      data-testid="deploy-fee"
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
        borderColor: "primary.red.600",
        boxShadow: "menu",
      }}
    >
      <Flex px={3} py={2}>
        {children}
      </Flex>
      <Flex
        backgroundColor="surface-danger-default"
        justifyContent="center"
        alignItems="center"
        borderBottomRadius="xl"
        p="1"
      >
        <L2Bold color="text-danger">
          {userClickedAddFunds
            ? "Waiting for funds..."
            : "Insufficient funds to pay fee"}
        </L2Bold>
      </Flex>
    </Flex>
  )
}
