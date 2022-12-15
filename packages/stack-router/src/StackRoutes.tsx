import { Flex } from "@chakra-ui/react"
import { AnimatePresence } from "framer-motion"
import { ComponentProps, FC, useMemo } from "react"
import { Routes, useLocation } from "react-router-dom"

import { getMatchingPath } from "./getMatchingPath"
import { getWrappedChildrenAndPresentation } from "./getWrappedChildrenAndPresentation"
import { StackContextProvider } from "./StackContext"

export const StackRoutes: FC<ComponentProps<typeof Flex>> = ({
  children,
  ...rest
}) => {
  const location = useLocation()
  const { wrappedChildren, declaredPresentationByPath, paths } = useMemo(
    () => getWrappedChildrenAndPresentation(children),
    [children],
  )
  const path = getMatchingPath(location.pathname, paths)
  return (
    <StackContextProvider
      declaredPresentationByPath={declaredPresentationByPath}
      paths={paths}
    >
      <Flex
        position={"relative"}
        w={"100%"}
        h={"100%"}
        overflow={"hidden"}
        flexDirection={"column"}
        {...rest}
      >
        <AnimatePresence initial={false}>
          <Routes location={location} key={path}>
            {wrappedChildren}
          </Routes>
        </AnimatePresence>
      </Flex>
    </StackContextProvider>
  )
}
