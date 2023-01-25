import Tippy from "@tippyjs/react"
import { FC } from "react"

import { Tooltip } from "../../../../components/CopyTooltip"
import { FieldKey, FieldKeyGroup } from "../../../../components/Fields"
import {
  CaptionText,
  StyledInfoRoundedIcon,
  StyledReportGmailerrorredRoundedIcon,
} from "../styled"
import { getTooltipText } from "../utils"

const NetworkFee: FC<{
  needsDeploy: boolean
  fee: any
  feeTokenBalance: any
  enoughBalance: boolean
}> = ({ fee, feeTokenBalance, needsDeploy, enoughBalance }) => {
  return (
    <>
      <FieldKeyGroup>
        <FieldKey>
          Network fee
          <Tippy
            content={
              <Tooltip as="div">
                {getTooltipText(fee?.suggestedMaxFee, feeTokenBalance)}
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
        {needsDeploy && (
          <CaptionText>Includes one-time activation fee</CaptionText>
        )}
      </FieldKeyGroup>
    </>
  )
}

export { NetworkFee }
