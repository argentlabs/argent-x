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
import { usePrettyError } from "../../hooks/usePrettyError"

const { AlertIcon } = icons

export interface WithActionScreenErrorFooterProps extends PropsWithChildren {
  isTransaction?: boolean
}

export const WithActionScreenErrorFooter: FC<
  WithActionScreenErrorFooterProps
> = ({ children, isTransaction }) => {
  const { action } = useActionScreen()
  const { errorMessage, title } = usePrettyError(
    action?.meta.errorApproving,
    isTransaction,
  )
  if (!errorMessage) {
    return <>{children}</>
  }
  return (
    <>
      {children}
      <Accordion size="sm" colorScheme="error" boxShadow={"menu"} allowToggle>
        <AccordionItem>
          <AccordionButton>
            <AlertIcon display={"inline-block"} fontSize={"base"} mr={1} />{" "}
            <Box as="span" flex="1" textAlign="left">
              {title}
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>{errorMessage}</AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  )
}
