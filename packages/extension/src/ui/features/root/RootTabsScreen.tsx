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
import {
  AccountListScreenContainerPreload,
  AccountListScreenPreloadProvider,
} from "../accounts/AccountListScreenContainerPreload"

interface RootTabsScreeenProps extends PropsWithChildren {
  scrollKey: string
  hideAccountNavigationBar?: boolean
}

export const RootTabsScreen: FC<RootTabsScreeenProps> = ({
  scrollKey,
  children,
  hideAccountNavigationBar,
}) => {
  const { scrollRef, scroll } = useScrollRestoration(scrollKey)
  return (
    <AccountListScreenPreloadProvider>
      <Suspense fallback={<NavigationBarSkeleton />}>
        {!hideAccountNavigationBar && (
          <AccountNavigationBarContainer scroll={scroll} />
        )}
      </Suspense>
      <Suspense fallback={<Flex flex={1} />}>
        <ScrollContainer ref={scrollRef}>{children}</ScrollContainer>
      </Suspense>
      <Suspense>
        <RootTabsContainer />
      </Suspense>
      <AccountListScreenContainerPreload />
    </AccountListScreenPreloadProvider>
  )
}
