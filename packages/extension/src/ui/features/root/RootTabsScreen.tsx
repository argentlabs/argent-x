import {
  NavigationBarSkeleton,
  ScrollContainer,
  useScrollRestoration,
} from "@argent/x-ui"
import type { FC, PropsWithChildren } from "react"
import { Suspense } from "react"
import { Flex } from "@chakra-ui/react"

import { AccountNavigationBarContainer } from "../navigation/AccountNavigationBarContainer"
import { RootTabsContainer } from "./RootTabsContainer"

interface RootTabsScreeenProps extends PropsWithChildren {
  scrollKey: string
}

export const RootTabsScreeen: FC<RootTabsScreeenProps> = ({
  scrollKey,
  children,
}) => {
  const { scrollRef, scroll } = useScrollRestoration(scrollKey)
  return (
    <>
      <Suspense fallback={<NavigationBarSkeleton />}>
        <AccountNavigationBarContainer scroll={scroll} />
      </Suspense>
      <Suspense fallback={<Flex flex={1} />}>
        <ScrollContainer ref={scrollRef}>{children}</ScrollContainer>
      </Suspense>
      <Suspense>
        <RootTabsContainer />
      </Suspense>
    </>
  )
}
