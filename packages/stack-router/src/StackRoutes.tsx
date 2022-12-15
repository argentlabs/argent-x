import { Flex } from "@chakra-ui/react"
import { AnimatePresence } from "framer-motion"
import { ComponentProps, FC, useMemo } from "react"
import { Routes, useLocation } from "react-router-dom"

import { getWrappedChildrenAndPresentation } from "./getWrappedChildrenAndPresentation"
import { StackContextProvider } from "./StackContext"

export const StackRoutes: FC<ComponentProps<typeof Flex>> = ({
  children,
  ...rest
}) => {
  const location = useLocation()
  const { wrappedChildren, declaredPresentationByPath } = useMemo(
    () => getWrappedChildrenAndPresentation(children),
    [children],
  )
  return (
    <StackContextProvider
      declaredPresentationByPath={declaredPresentationByPath}
    >
      <Flex
        position={"relative"}
        w={"100%"}
        h={"100%"}
        overflow={"hidden"}
        {...rest}
      >
        <AnimatePresence initial={false}>
          <Routes location={location} key={location.pathname}>
            {wrappedChildren}
          </Routes>
        </AnimatePresence>
      </Flex>
    </StackContextProvider>
  )
}
