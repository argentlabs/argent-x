import { Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react"
import { FC } from "react"

interface AccountListItemSkeletonProps {
  avatarSize?: number
}

export const AccountListItemSkeleton: FC<AccountListItemSkeletonProps> = ({
  avatarSize = 12,
}) => {
  return (
    <Skeleton
      display={"flex"}
      alignItems={"center"}
      gap={3}
      p={4}
      height="19"
      rounded={"xl"}
      position={"relative"}
      sx={{
        "&::before, &::after, *": {
          visibility: "visible",
        },
      }}
    >
      <SkeletonCircle w={avatarSize} h={avatarSize} />
      <SkeletonText noOfLines={2} w={"33.3%"} />
    </Skeleton>
  )
}
