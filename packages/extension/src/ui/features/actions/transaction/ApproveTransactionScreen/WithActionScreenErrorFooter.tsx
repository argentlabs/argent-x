import { icons } from "@argent/ui"
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from "@chakra-ui/react"
import React, { FC, PropsWithChildren } from "react"

import { useActionScreen } from "../../hooks/useActionScreen"

const { AlertIcon } = icons

export interface WithActionScreenErrorFooterProps extends PropsWithChildren {
  isTransaction?: boolean
}

export const WithActionScreenErrorFooter: FC<
  WithActionScreenErrorFooterProps
> = ({ children, isTransaction }) => {
  const { action } = useActionScreen()
  if (!action?.meta.errorApproving) {
    return <>{children}</>
  }
  const message = isTransaction ? "Transaction failed" : "Action failed"
  return (
    <>
      {children}
      <Accordion size="sm" colorScheme="error" boxShadow={"menu"} allowToggle>
        <AccordionItem>
          <AccordionButton>
            <AlertIcon display={"inline-block"} fontSize={"base"} mr={1} />{" "}
            <Box as="span" flex="1" textAlign="left">
              {message}
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>{action.meta.errorApproving}</AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  )
}
