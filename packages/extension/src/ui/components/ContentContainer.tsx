import { AbsoluteBox, scrollbarStyle } from "@argent/ui"
import { ComponentProps, forwardRef } from "react"

import { NavigationBarHeight } from "./NavigationBar"
import { TabBarHeight } from "./TabBar"

interface ContentContainerProps extends ComponentProps<typeof AbsoluteBox> {
  /** top should be inset for NavigationBar component */
  navigationBarInset?: boolean
  /** bottom should be inset for TabBar component */
  tabBarInset?: boolean
}

export const ContentContainer = forwardRef<
  HTMLDivElement,
  ContentContainerProps
>(({ navigationBarInset, tabBarInset, ...rest }, ref) => {
  return (
    <AbsoluteBox
      ref={ref}
      overflow={"overlay"}
      top={navigationBarInset ? NavigationBarHeight : undefined}
      bottom={tabBarInset ? TabBarHeight : undefined}
      sx={scrollbarStyle}
      {...rest}
    />
  )
})
ContentContainer.displayName = "ContentContainer"
