import { CopyTooltip, icons } from "@argent/ui"
import { Box, Fade, useAccordionItemState } from "@chakra-ui/react"
import { FC } from "react"

import { FeeEstimationProps } from "../FeeEstimation"

const { CopyIcon } = icons

export const CopyErrorIcon: FC<
  Pick<FeeEstimationProps, "parsedFeeEstimationError">
> = ({ parsedFeeEstimationError }) => {
  const { isOpen } = useAccordionItemState()
  if (!parsedFeeEstimationError || !isOpen) {
    return null
  }
  return (
    <Fade in={isOpen}>
      <CopyTooltip copyValue={parsedFeeEstimationError}>
        <Box
          onClick={(e) => {
            /** prevent accordion from collapsing */
            e.preventDefault()
          }}
        >
          <CopyIcon />
        </Box>
      </CopyTooltip>
    </Fade>
  )
}
