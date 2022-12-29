import { L2, P4 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import Tippy from "@tippyjs/react"
import { FC, useEffect, useMemo, useState } from "react"
import { number } from "starknet"

import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import { Tooltip } from "../../../components/CopyTooltip"
import {
  FieldError,
  FieldKeyGroup,
  FieldValue,
} from "../../../components/Fields"
import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useFeeTokenBalance } from "../../accountTokens/tokens.service"
import { useNetworkFeeToken } from "../../accountTokens/tokens.state"
import {
  FeeEstimationValue,
  LoadingInput,
  StyledInfoRoundedIcon,
  StyledReportGmailerrorredRoundedIcon,
} from "./styled"
import { TransactionsFeeEstimationProps } from "./types"
import { getTooltipText, useMaxFeeEstimation } from "./utils"
import { getParsedError } from "./utils"

export const FeeEstimation: FC<TransactionsFeeEstimationProps> = ({
  accountAddress,
  transactions,
  actionHash,
  onErrorChange,
  networkId,
}) => {
  const account = useAccount({ address: accountAddress, networkId })
  if (!account) {
    throw new Error("Account not found")
  }

  const [feeEstimateExpanded, setFeeEstimateExpanded] = useState(false)

  const { feeTokenBalance } = useFeeTokenBalance(account)

  const { fee, error } = useMaxFeeEstimation(transactions, actionHash)

  const totalMaxFee = useMemo(() => {
    if (account.needsDeploy && fee?.maxADFee) {
      return number.toHex(
        number.toBN(fee.maxADFee).add(number.toBN(fee.suggestedMaxFee)),
      )
    }
    return fee?.suggestedMaxFee
  }, [account.needsDeploy, fee?.maxADFee, fee?.suggestedMaxFee])

  const enoughBalance = useMemo(
    () => Boolean(totalMaxFee && feeTokenBalance?.gte(totalMaxFee)),
    [feeTokenBalance, totalMaxFee],
  )

  const showFeeError = Boolean(fee && feeTokenBalance && !enoughBalance)
  const showEstimateError = Boolean(error)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !feeTokenBalance || !enoughBalance || showError
  useEffect(() => {
    onErrorChange?.(hasError)
    // only rerun when error changes
  }, [hasError]) // eslint-disable-line react-hooks/exhaustive-deps

  const parsedFeeEstimationError = showEstimateError && getParsedError(error)
  const feeToken = useNetworkFeeToken(networkId)
  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.amount,
  )
  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.suggestedMaxFee,
  )

  return (
    <Flex
      borderRadius="xl"
      backgroundColor="neutrals.900"
      border="1px"
      borderColor="neutrals.500"
      boxShadow="menu"
      justifyContent="space-between"
      px="3"
      py="3.5"
    >
      <FieldKeyGroup>
        <P4 fontWeight="bold" color="neutrals.300">
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
        </P4>
      </FieldKeyGroup>
      {fee ? (
        <Flex gap="1" alignItems="center">
          {suggestedMaxFeeCurrencyValue !== undefined ? (
            <L2 color="neutrals.300">
              (Max {prettifyCurrencyValue(suggestedMaxFeeCurrencyValue)})
            </L2>
          ) : (
            <L2 color="neutrals.300">
              (Max &nbsp;
              {feeToken ? (
                prettifyTokenAmount({
                  amount: fee.suggestedMaxFee,
                  decimals: feeToken.decimals,
                  symbol: feeToken.symbol,
                })
              ) : (
                <>{fee.suggestedMaxFee} Unknown</>
              )}
              )
            </L2>
          )}

          <P4 fontWeight="bold">≈</P4>

          <FieldValue>
            {amountCurrencyValue !== undefined ? (
              <P4 fontWeight="bold">
                {prettifyCurrencyValue(amountCurrencyValue)}
              </P4>
            ) : (
              <P4 fontWeight="bold">
                {feeToken ? (
                  prettifyTokenAmount({
                    amount: fee.amount,
                    decimals: feeToken.decimals,
                    symbol: feeToken.symbol,
                  })
                ) : (
                  <>{fee.amount} Unknown</>
                )}
              </P4>
            )}
          </FieldValue>
        </Flex>
      ) : showEstimateError ? (
        <FeeEstimationValue>Error</FeeEstimationValue>
      ) : (
        <LoadingInput />
      )}

      {showFeeError && <FieldError>Not enough funds to cover fee</FieldError>}
      {/* {showEstimateError && (
        <>
          <FieldError justify="space-between">
            Transaction failure predicted
            <ExtendableControl
              {...makeClickable(() => setFeeEstimateExpanded((x) => !x), {
                label: "Show error details",
              })}
            >
              <DetailsText>Details</DetailsText>
              <KeyboardArrowDownRounded
                style={{
                  transition: "transform 0.2s ease-in-out",
                  transform: feeEstimateExpanded
                    ? "rotate(-180deg)"
                    : "rotate(0deg)",
                  height: 13,
                  width: 13,
                }}
              />
            </ExtendableControl>
          </FieldError>

          <Collapse
            in={feeEstimateExpanded}
            timeout="auto"
            style={{
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            {parsedFeeEstimationError && (
              <CopyTooltip
                copyValue={parsedFeeEstimationError}
                message="Copied"
              >
                <FeeErrorContainer>
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {parsedFeeEstimationError}
                  </pre>
                </FeeErrorContainer>
              </CopyTooltip>
            )}
          </Collapse>
        </>
      )} */}
    </Flex>
  )
}
