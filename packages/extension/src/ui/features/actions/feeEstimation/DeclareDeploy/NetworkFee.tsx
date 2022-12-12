import Tippy from "@tippyjs/react"
import { FC } from "react"

import { Tooltip } from "../../../../components/CopyTooltip"
import { FieldKey, FieldKeyGroup } from "../../../../components/Fields"
import {
  StyledInfoRoundedIcon,
  StyledReportGmailerrorredRoundedIcon,
} from "../styled"
import { getTooltipText } from "../utils"

const NetworkFee: FC<{
  fee: any
  feeTokenBalance: any
  enoughBalance: boolean
}> = ({ fee, feeTokenBalance, enoughBalance }) => {
  return (
    <FieldKeyGroup>
      <FieldKey>
        Network fee
        <Tippy
          content={
            <Tooltip as="div">
              {getTooltipText(fee?.maxADFee, feeTokenBalance)}
            </Tooltip>
          }
        >
          {enoughBalance ? (
            <StyledInfoRoundedIcon />
          ) : (
            <StyledReportGmailerrorredRoundedIcon />
          )}
        </Tippy>
      </FieldKey>
    </FieldKeyGroup>
  )
}

export { NetworkFee }
