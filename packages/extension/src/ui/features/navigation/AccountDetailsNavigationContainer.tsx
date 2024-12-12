import type { NavigationContainerProps } from "@argent/x-ui"
import { ScrollContainer, useScroll } from "@argent/x-ui"
import type { FC } from "react"
import { AccountDetailsNavigationBarContainer } from "./AccountDetailsNavigationBarContainer"

/** No `scrollKey`, no scroll restoration */

export const AccountDetailsNavigationContainer: FC<
  NavigationContainerProps
> = ({ children, ...rest }) => {
  const { scrollRef, scroll } = useScroll()
  return (
    <>
      <AccountDetailsNavigationBarContainer scroll={scroll} {...rest} />
      <ScrollContainer ref={scrollRef}>{children}</ScrollContainer>
    </>
  )
}
