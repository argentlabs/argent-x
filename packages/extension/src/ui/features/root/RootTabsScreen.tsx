import {
  NavigationBarSkeleton,
  ScrollContainer,
  useScrollRestoration,
} from "@argent/x-ui"
import { FC, PropsWithChildren, Suspense } from "react"

import { AccountNavigationBarContainer } from "../accounts/AccountNavigationBarContainer"
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
      <Suspense>
        <ScrollContainer ref={scrollRef}>{children}</ScrollContainer>
      </Suspense>
      <Suspense>
        <RootTabsContainer />
      </Suspense>
    </>
  )
}
