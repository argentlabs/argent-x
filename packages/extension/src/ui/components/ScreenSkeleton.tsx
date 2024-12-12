import { CellStack, NavigationContainerSkeleton } from "@argent/x-ui"
import type { FlexProps } from "@chakra-ui/react"
import { Skeleton } from "@chakra-ui/react"
import type { FC, PropsWithChildren } from "react"

export interface ScreenSkeletonProps extends PropsWithChildren {
  list?: boolean
}

export const ListSkeleton: FC<FlexProps> = (props) => {
  return (
    <CellStack py={0} {...props}>
      <Skeleton height="19" rounded={"xl"} />
      <Skeleton height="19" rounded={"xl"} />
      <Skeleton height="19" rounded={"xl"} />
    </CellStack>
  )
}

export const ScreenSkeleton: FC<ScreenSkeletonProps> = ({ list, children }) => {
  return (
    <NavigationContainerSkeleton>
      {list && <ListSkeleton />}
      <>{children}</>
    </NavigationContainerSkeleton>
  )
}
