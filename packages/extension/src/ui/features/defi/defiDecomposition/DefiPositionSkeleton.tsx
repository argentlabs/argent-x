import type { FlexProps } from "@chakra-ui/react"
import { Flex, Skeleton, SkeletonText } from "@chakra-ui/react"
import type { FC } from "react"
import { DefiPositionSubtitle } from "./DefiPositionSubtitle"
import { DefiPositionTitle } from "./DefiPositionTitle"

export const DefiPositionSkeleton: FC<FlexProps> = (props) => {
  return (
    <Flex
      rounded="xl"
      w="full"
      bg="surface-elevated"
      minHeight={18.5}
      p={4}
      gap="1"
      justifyContent="space-between"
      alignItems="center"
      {...props}
    >
      <Flex gap="2" alignItems="center" flex={1}>
        <Skeleton rounded="full" w={10} h={10} />
        <SkeletonText noOfLines={2} w="50%" />
      </Flex>
      {/* Use of text and &nbsp; ensures the skeleton has the same text height as DefiPosition */}
      <Flex direction="column" gap={0.5} overflow="hidden">
        <DefiPositionTitle>&nbsp;</DefiPositionTitle>
        <DefiPositionSubtitle>&nbsp;</DefiPositionSubtitle>
      </Flex>
      <SkeletonText noOfLines={1} w="20%" />
    </Flex>
  )
}
