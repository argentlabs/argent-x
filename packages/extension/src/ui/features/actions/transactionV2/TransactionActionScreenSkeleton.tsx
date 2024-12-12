import type { FlexProps } from "@chakra-ui/react"
import { Button, Flex, SimpleGrid, SkeletonText } from "@chakra-ui/react"
import type { FC } from "react"

import type { ExtensionActionItemOfType } from "../../../../shared/actionQueue/types"
import { TransactionHeader } from "./header"
import { FeeEstimationBoxSkeleton } from "../feeEstimation/ui/FeeEstimationBox"
import { NavigationBarSkeleton } from "@argent/x-ui"

interface TransactionActionScreenSekeletonProps {
  action: ExtensionActionItemOfType<"TRANSACTION">
}

export const TransactionReviewSkeleton: FC<FlexProps> = (props) => {
  return (
    <Flex direction="column" {...props}>
      <Flex bg="surface-elevated" p={4} rounded="lg" h="156px">
        <SkeletonText noOfLines={1} w="20%" />
      </Flex>
      <Flex
        bg="surface-elevated"
        p={4}
        alignItems="center"
        rounded="lg"
        h="10"
        mt={2}
      >
        <SkeletonText noOfLines={1} w="20%" />
      </Flex>
      <Flex
        bg="surface-elevated"
        p={4}
        alignItems="center"
        rounded="lg"
        h="10"
        mt={1}
      >
        <SkeletonText noOfLines={1} w="20%" />
      </Flex>
    </Flex>
  )
}

export const TransactionActionScreenSekeleton: FC<
  TransactionActionScreenSekeletonProps
> = ({ action }) => {
  return (
    <Flex direction="column" flex={1}>
      <NavigationBarSkeleton />
      <Flex direction="column" gap={2} flex={1} pb={4}>
        <TransactionHeader
          title={action.meta?.title}
          subtitle={action.meta?.subtitle ?? action.meta.origin}
          dappHost={action.meta.origin}
          iconKey={action.meta?.icon}
        />
        <TransactionReviewSkeleton px={4} />
        <Flex flex={1} />
        <Flex direction="column" gap={3} px={4}>
          <FeeEstimationBoxSkeleton />
          <SimpleGrid w="full" columns={2} spacing={2}>
            <Button isDisabled>
              <SkeletonText noOfLines={1} w="50%" />
            </Button>
            <Button colorScheme="primary" isDisabled>
              <SkeletonText noOfLines={1} w="50%" />
            </Button>
          </SimpleGrid>
        </Flex>
      </Flex>
    </Flex>
  )
}
