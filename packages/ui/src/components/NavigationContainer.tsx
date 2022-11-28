import React, { FC } from "react"

import { useScroll } from "../hooks"
import { NavigationBar, NavigationBarProps } from "./NavigationBar"
import { ScrollContainer } from "./ScrollContainer"

/**
 * Combines {@link NavigationBar} and {@link ScrollContainer} and sets up the scroll interaction between them
 */

export const NavigationContainer: FC<Omit<NavigationBarProps, "scroll">> = ({
  scrollContent,
  children,
  ...rest
}) => {
  const { scrollRef, scroll } = useScroll()
  return (
    <>
      <NavigationBar scroll={scroll} {...rest} scrollContent={scrollContent} />
      <ScrollContainer ref={scrollRef}>{children}</ScrollContainer>
    </>
  )
}
