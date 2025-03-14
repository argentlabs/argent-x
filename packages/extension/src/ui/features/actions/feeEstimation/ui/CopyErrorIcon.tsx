import { CopyPrimaryIcon } from "@argent/x-ui/icons"
import { CopyTooltip } from "@argent/x-ui"
import { Box, Fade, useAccordionItemState } from "@chakra-ui/react"
import type { FC } from "react"

interface CopyErrorIconProps {
  copyValue?: string
}

export const CopyErrorIcon: FC<CopyErrorIconProps> = ({ copyValue }) => {
  const { isOpen } = useAccordionItemState()
  if (!copyValue || !isOpen) {
    return null
  }
  return (
    <Fade in={isOpen}>
      <CopyTooltip copyValue={copyValue}>
        <Box
          onClick={(e) => {
            /** prevent accordion from collapsing */
            e.preventDefault()
          }}
        >
          <CopyPrimaryIcon />
        </Box>
      </CopyTooltip>
    </Fade>
  )
}
