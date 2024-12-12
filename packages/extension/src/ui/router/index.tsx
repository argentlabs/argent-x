import {
  Route as StackRouterRoute,
  Routes as StackRouterRoutes,
  RoutesConfig as StackRouterRoutesConfig,
} from "@argent/stack-router"
import { Flex } from "@chakra-ui/react"
import type { PropsWithChildren } from "react"
import {
  Route as ReactRouterRoute,
  Routes as ReactRouterRoutes,
} from "react-router-dom"

import { isPlaywright } from "../../shared/api/constants"

/**
 * When disabled, the app will render with vanilla react-router-dom Routes / Route
 */
const ENABLE_STACK_ROUTER = !isPlaywright // disabled in Playwright - flaky behaviour with duplicate elements

/**
 * Ignore props and simply render the children in a flex column container styled like stack-router
 */
const ReactRouterRoutesConfig = ({ children }: PropsWithChildren) => (
  <Flex direction="column" position="absolute" inset={0}>
    {children}
  </Flex>
)

const { Route, Routes, RoutesConfig } = ENABLE_STACK_ROUTER
  ? {
      Route: StackRouterRoute,
      Routes: StackRouterRoutes,
      RoutesConfig: StackRouterRoutesConfig,
    }
  : {
      Route: ReactRouterRoute,
      Routes: ReactRouterRoutes,
      RoutesConfig: ReactRouterRoutesConfig,
    }

export { Route, Routes, RoutesConfig }
