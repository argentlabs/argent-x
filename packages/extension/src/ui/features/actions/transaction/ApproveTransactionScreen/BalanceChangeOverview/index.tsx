import {
  DetailAccordion,
  DetailAccordionButton,
  DetailAccordionHeader,
  DetailAccordionItem,
  DetailAccordionPanel,
  DetailAccordionRow,
  L2,
  P3,
  P4,
  TextWithAmount,
  icons,
} from "@argent/ui"
import { Box, Divider, Flex, Image, Text, Tooltip } from "@chakra-ui/react"
import BigNumber from "bignumber.js"
import { motion } from "framer-motion"
import { isEmpty, isString } from "lodash-es"
import { FC, useMemo } from "react"

import {
  isUnlimitedAmount,
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../../../shared/token/price"
import {
  ApiTransactionReviewResponse,
  getTransactionReviewWithType,
} from "../../../../../../shared/transactionReview.service"
import {
  formatTruncatedAddress,
  normalizeAddress,
} from "../../../../../services/addresses"
import {
  useCurrentNetwork,
  useIsMainnet,
} from "../../../../networks/useNetworks"
import { AggregatedSimData } from "../../useTransactionSimulatedData"
import { UnknownTokenIcon } from "../DappHeader/TransactionIcon/UnknownTokenIcon"
import { NftDetails } from "./NftDetails"

const { InfoIcon, AlertIcon } = icons

export interface BalanceChangeOverviewProps {
  aggregatedData: AggregatedSimData[]
  transactionReview?: ApiTransactionReviewResponse
}

export const BalanceChangeOverview: FC<BalanceChangeOverviewProps> = ({
  aggregatedData,
  transactionReview,
}) => {
  const network = useCurrentNetwork()
  const transactionReviewWithType = useMemo(
    () => getTransactionReviewWithType(transactionReview),
    [transactionReview],
  )
  const allTransferSafe = useMemo(
    () => aggregatedData.every((t) => t.safe),
    [aggregatedData],
  )

  const isMainnet = useIsMainnet()
  const isTransfer = transactionReviewWithType?.type === "transfer"

  if (aggregatedData.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box>
        <DetailAccordionHeader>
          {isTransfer ? (
            <>Balance change</>
          ) : (
            <>
              Estimated balance change
              <Tooltip label="The estimated balance change after transaction execution">
                <Text color="neutrals.300" fontSize={"2xs"} cursor="pointer">
                  <InfoIcon />
                </Text>
              </Tooltip>
            </>
          )}
        </DetailAccordionHeader>
        <DetailAccordion
          allowToggle
          defaultIndex={!allTransferSafe ? 0 : undefined}
        >
          {aggregatedData.map(
            (
              { amount, recipients, token, usdValue, approvals, safe },
              dataIndex,
            ) => {
              if (isString(amount)) {
                amount = new BigNumber(amount)
              }
              return (
                <DetailAccordionItem
                  key={[token.address, "transfer", dataIndex].join("-")}
                  isDisabled={isEmpty(approvals) && isEmpty(recipients)}
                >
                  {({ isDisabled, isExpanded }) => (
                    <>
                      {token.type === "erc20" ? (
                        <DetailAccordionButton
                          isDisabled={isDisabled}
                          isExpanded={isExpanded}
                        >
                          <Flex alignItems="center" gap="2">
                            {token.image ? (
                              <Image src={token.image} w="5" h="5" />
                            ) : (
                              <UnknownTokenIcon w="5" h="5" fontSize="10px" />
                            )}
                            <P4 fontWeight="medium">
                              {token.name === "Ether" ? "Ethereum" : token.name}{" "}
                            </P4>
                            {!safe && (
                              <P3
                                color="error.500"
                                fontWeight="medium"
                                mt="0.25"
                              >
                                <AlertIcon />
                              </P3>
                            )}
                          </Flex>
                          <Flex
                            direction="column"
                            gap="0.5"
                            alignItems="flex-end"
                          >
                            <TextWithAmount
                              amount={amount.toFixed()}
                              decimals={token.decimals}
                            >
                              <P4
                                color={
                                  amount.isNegative()
                                    ? "error.500"
                                    : "secondary.500"
                                }
                                fontWeight="medium"
                              >
                                {prettifyTokenAmount({
                                  amount: amount.toFixed(),
                                  decimals: token.decimals,
                                  symbol:
                                    token.type === "erc20"
                                      ? token.symbol
                                      : "NFT",
                                  showPlusSign: true,
                                })}
                              </P4>
                            </TextWithAmount>

                            {/** 0 usdValue means we don't have any value */}
                            {isMainnet && !!usdValue && !usdValue.isZero() && (
                              <L2 color="neutrals.300">
                                {prettifyCurrencyValue(
                                  usdValue.abs().toFixed(),
                                )}
                              </L2>
                            )}
                          </Flex>
                        </DetailAccordionButton>
                      ) : (
                        <NftDetails
                          contractAddress={token.address}
                          tokenId={token.tokenId}
                          networkId={network.id}
                          dataIndex={dataIndex}
                          totalData={aggregatedData.length}
                          amount={amount}
                          usdValue={usdValue}
                          safe={safe}
                          isMainnet={isMainnet}
                          isDisabled={isDisabled}
                        />
                      )}
                      <DetailAccordionPanel
                        isDisabled={isDisabled}
                        isExpanded={isExpanded}
                      >
                        {!isEmpty(approvals) && (
                          <>
                            <DetailAccordionRow
                              header={
                                <>
                                  Approved spending limit
                                  <Tooltip label="The approved spending limit to one or multiple addresses after transaction execution">
                                    <Text color="neutrals.300" cursor="pointer">
                                      <InfoIcon />
                                    </Text>
                                  </Tooltip>
                                </>
                              }
                            />
                            {approvals.map((approval, approvalIndex) => {
                              if (isString(approval.amount)) {
                                approval.amount = new BigNumber(approval.amount)
                              }
                              return (
                                <DetailAccordionRow
                                  key={approvalIndex}
                                  label={formatTruncatedAddress(
                                    approval.spender,
                                  )}
                                  copyLabel={normalizeAddress(approval.spender)}
                                  value={
                                    <TextWithAmount
                                      amount={approval.amount.toFixed()}
                                      decimals={approval.token.decimals}
                                    >
                                      <Text
                                        color={
                                          isUnlimitedAmount(
                                            approval.amount.toFixed(),
                                          )
                                            ? "error.500"
                                            : undefined
                                        }
                                      >
                                        {prettifyTokenAmount({
                                          amount: approval.amount.toFixed(),
                                          ...approval.token,
                                          unlimitedText: "All your",
                                        })}
                                      </Text>
                                    </TextWithAmount>
                                  }
                                />
                              )
                            })}
                          </>
                        )}
                        {!isEmpty(recipients) && (
                          <>
                            {!isEmpty(approvals) && (
                              <Divider color="black" opacity="1" />
                            )}
                            <DetailAccordionRow header={"Recipients"} />
                            {recipients.map((recipient, recipientIndex) => {
                              if (isString(recipient.amount)) {
                                recipient.amount = new BigNumber(
                                  recipient.amount,
                                )
                              }
                              return (
                                <DetailAccordionRow
                                  key={[
                                    "recipient",
                                    recipient.address,
                                    recipientIndex,
                                  ].join("-")}
                                  label={formatTruncatedAddress(
                                    recipient.address,
                                  )}
                                  copyLabel={normalizeAddress(
                                    recipient.address,
                                  )}
                                  value={
                                    <TextWithAmount
                                      amount={recipient.amount.toFixed()}
                                      decimals={token.decimals}
                                    >
                                      <Text>
                                        {prettifyTokenAmount({
                                          amount: recipient.amount.toFixed(),
                                          ...token,
                                          withSymbol: false,
                                        })}
                                      </Text>
                                    </TextWithAmount>
                                  }
                                />
                              )
                            })}
                          </>
                        )}
                      </DetailAccordionPanel>
                    </>
                  )}
                </DetailAccordionItem>
              )
            },
          )}
          {!allTransferSafe && (
            <DetailAccordionItem>
              <Box m="2" borderRadius="lg" px="2" py="3" bgColor="neutrals.700">
                <Flex
                  justifyContent="flex-start"
                  alignItems="flex-start"
                  gap="2"
                >
                  <P3 color="error.500" fontWeight="medium" mt="0.25">
                    <AlertIcon />
                  </P3>
                  <Flex direction="column" gap="1" alignItems="flex-start">
                    <P4 color="error.500" fontWeight="medium">
                      Warning: Approved spending limit
                    </P4>
                    <P4 color="neutrals.100">
                      You’re approving one or more addresses to spend more
                      tokens than you’re using in this transaction. These funds
                      will not be spent but you should not proceed if you don’t
                      trust this app
                    </P4>
                  </Flex>
                </Flex>
              </Box>
            </DetailAccordionItem>
          )}
        </DetailAccordion>
      </Box>
    </motion.div>
  )
}
