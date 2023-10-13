import { CellStack, NavigationContainerSkeleton } from "@argent/ui"
import { Skeleton } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

export interface ScreenSkeletonProps extends PropsWithChildren {
  list?: boolean
}

export const ListSkeleton: FC = () => {
  return (
    <CellStack py={0}>
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
