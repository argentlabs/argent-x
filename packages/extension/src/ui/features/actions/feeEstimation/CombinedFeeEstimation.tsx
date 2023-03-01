import { L1, L2, P4, Pre, TextWithAmount, icons } from "@argent/ui"
import { Flex, Text, Tooltip } from "@chakra-ui/react"
import { Collapse } from "@mui/material"
import { BigNumber, utils } from "ethers"
import { FC, useEffect, useMemo, useState } from "react"
import { number } from "starknet"

import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import { Token } from "../../../../shared/token/type"
import { getFeeToken } from "../../../../shared/token/utils"
import { CopyTooltip } from "../../../components/CopyTooltip"
import { makeClickable } from "../../../services/a11y"
import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useFeeTokenBalance } from "../../accountTokens/tokens.service"
import { useExtensionIsInTab } from "../../browser/tabs"
import { ExtendableControl, FeeEstimationValue, LoadingInput } from "./styled"
import { TransactionsFeeEstimationProps } from "./types"
import { getParsedError, useMaxFeeEstimation } from "./utils"

const { AlertIcon, ChevronDownIcon, InfoIcon } = icons

export const CombinedFeeEstimation: FC<TransactionsFeeEstimationProps> = ({
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

  const [feeErrorExpanded, setFeeErrorExpanded] = useState(false)

  const { feeTokenBalance } = useFeeTokenBalance(account)

  const { fee, error } = useMaxFeeEstimation(transactions, actionHash)

  const totalFee = useMemo(() => {
    if (account.needsDeploy && fee?.accountDeploymentFee) {
      return number.toHex(
        number.toBN(fee.accountDeploymentFee).add(number.toBN(fee.amount)),
      )
    }
    return fee?.amount
  }, [account.needsDeploy, fee?.accountDeploymentFee, fee?.amount])

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
  const feeToken = getFeeToken(networkId)
  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.amount,
  )

  const totalMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    totalMaxFee,
  )

  const hasTransactions = typeof transactions !== undefined
  const extensionInTab = useExtensionIsInTab()

  if (!hasTransactions) {
    return <></>
  }

  return (
    <Flex direction="column" gap="1">
      <Flex
        borderRadius="xl"
        backgroundColor="neutrals.900"
        border="1px"
        borderColor="neutrals.500"
        boxShadow="menu"
        justifyContent="space-between"
        alignItems="flex-start"
        px="3"
        py="3.5"
        gap="1.5"
      >
        <Flex flexDirection="column" gap="2" alignItems="flex-start">
          <Flex alignItems="center" justifyContent="center" gap="5px">
            <P4 fontWeight="bold" color="neutrals.300">
              Network fees
            </P4>
            {feeToken && (
              <Tooltip
                label={getTooltipText({
                  feeToken,
                  feeTokenBalance,
                  totalMaxFee,
                  maxAccountDeploymentFee: fee?.maxADFee,
                  maxNetworkFee: fee?.suggestedMaxFee,
                })}
                p="3"
                placement="top"
                backgroundColor="black"
                border="1px solid"
                borderColor="neutrals.700"
                borderRadius="4px"
              >
                <Text
                  color="neutrals.300"
                  _hover={{
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  <InfoIcon />
                </Text>
              </Tooltip>
            )}
          </Flex>

          <L2 color="neutrals.300">Includes one-time activation fee</L2>
        </Flex>
        {totalFee && totalMaxFee ? (
          <Flex
            gap="1"
            alignItems="center"
            direction={extensionInTab ? "row" : "column-reverse"}
          >
            {totalMaxFeeCurrencyValue !== undefined ? (
              <L2 color="neutrals.300">
                (Max {prettifyCurrencyValue(totalMaxFeeCurrencyValue)})
              </L2>
            ) : (
              <TextWithAmount amount={totalMaxFee}>
                <L2 color="neutrals.300">
                  (Max &nbsp;
                  {feeToken ? (
                    prettifyTokenAmount({
                      amount: totalMaxFee,
                      decimals: feeToken.decimals,
                      symbol: feeToken.symbol,
                    })
                  ) : (
                    <>{totalMaxFee} Unknown</>
                  )}
                  )
                </L2>
              </TextWithAmount>
            )}

            <Flex alignItems="center">
              {amountCurrencyValue !== undefined ? (
                <P4 fontWeight="bold">
                  ≈ {prettifyCurrencyValue(amountCurrencyValue)}
                </P4>
              ) : (
                <TextWithAmount amount={totalFee}>
                  <P4 fontWeight="bold">
                    ≈{" "}
                    {feeToken ? (
                      prettifyTokenAmount({
                        amount: totalFee,
                        decimals: feeToken.decimals,
                        symbol: feeToken.symbol,
                      })
                    ) : (
                      <>{totalFee} Unknown</>
                    )}
                  </P4>
                </TextWithAmount>
              )}
            </Flex>
          </Flex>
        ) : showEstimateError ? (
          <FeeEstimationValue>Error</FeeEstimationValue>
        ) : (
          <LoadingInput />
        )}
      </Flex>

      {showError && (
        <Flex
          direction="column"
          backgroundColor="#330105"
          boxShadow="menu"
          py="3.5"
          px="3.5"
          borderRadius="xl"
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Flex gap="1" align="center">
              <Text color="errorText">
                <AlertIcon />
              </Text>
              <L1 color="errorText">
                {showFeeError
                  ? "Not enough funds to cover for fees"
                  : "Transaction failure predicted"}
              </L1>
            </Flex>
            {!showFeeError && (
              <ExtendableControl
                {...makeClickable(() => setFeeErrorExpanded((x) => !x), {
                  label: "Show error details",
                })}
              >
                <Text color="errorText">
                  <ChevronDownIcon
                    style={{
                      transition: "transform 0.2s ease-in-out",
                      transform: feeErrorExpanded
                        ? "rotate(-180deg)"
                        : "rotate(0deg)",
                    }}
                    height="14px"
                    width="16px"
                  />
                </Text>
              </ExtendableControl>
            )}
          </Flex>

          <Collapse
            in={feeErrorExpanded}
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
                <Pre color="errorText" pt="3" whiteSpace="pre-wrap">
                  {parsedFeeEstimationError}
                </Pre>
              </CopyTooltip>
            )}
          </Collapse>
        </Flex>
      )}
    </Flex>
  )
}

interface FeeEstimationTooltipProps {
  feeToken: Token
  maxNetworkFee?: string
  maxAccountDeploymentFee?: string
  totalMaxFee?: string
  feeTokenBalance?: BigNumber
}

function getTooltipText({
  feeToken,
  feeTokenBalance,
  maxAccountDeploymentFee,
  maxNetworkFee,
  totalMaxFee,
}: FeeEstimationTooltipProps): JSX.Element {
  if (
    !maxNetworkFee ||
    !maxAccountDeploymentFee ||
    !totalMaxFee ||
    !feeTokenBalance
  ) {
    return <P4 color="neutrals.100">Network fee is still loading.</P4>
  }
  if (feeTokenBalance.gte(totalMaxFee)) {
    return (
      <Flex flexDirection="column" gap="3">
        <P4 color="neutrals.100">
          Network fees are paid to the network to include transactions in blocks
        </P4>

        <Flex flexDirection="column" gap="1">
          <Flex justifyContent="space-between">
            <L1 color="white">Starknet Network</L1>
            <TextWithAmount amount={maxNetworkFee}>
              <L1 color="white">
                ≈{" "}
                {prettifyTokenAmount({
                  amount: maxNetworkFee,
                  decimals: feeToken.decimals,
                  symbol: feeToken.symbol,
                })}
              </L1>
            </TextWithAmount>
          </Flex>
          <Flex justifyContent="space-between">
            <L1 color="white">One-time activation fee</L1>
            <TextWithAmount amount={maxAccountDeploymentFee}>
              <L1 color="white">
                ≈{" "}
                {prettifyTokenAmount({
                  amount: maxAccountDeploymentFee,
                  decimals: feeToken.decimals,
                  symbol: feeToken.symbol,
                })}
              </L1>
            </TextWithAmount>
          </Flex>
        </Flex>
      </Flex>
    )
  }
  return (
    <P4 color="neutrals.500">
      Insufficient balance to pay network fees. You need at least $
      {utils.formatEther(BigNumber.from(totalMaxFee).sub(feeTokenBalance))} ETH
      more.
    </P4>
  )
}
