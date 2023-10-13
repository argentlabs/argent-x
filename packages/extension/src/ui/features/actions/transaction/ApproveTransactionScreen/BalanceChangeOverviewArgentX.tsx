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
import { motion } from "framer-motion"
import { isEmpty, isString } from "lodash-es"
import { FC, useMemo } from "react"

import { bigDecimal } from "@argent/shared"
import {
  isUnlimitedAmount,
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../../shared/token/price"
import {
  ApiTransactionReviewResponse,
  getTransactionReviewWithType,
} from "../../../../../shared/transactionReview.service"
import {
  formatTruncatedAddress,
  normalizeAddress,
} from "../../../../services/addresses"
import { useCurrentNetwork } from "../../../networks/hooks/useCurrentNetwork"
import { useIsDefaultNetwork } from "../../../networks/hooks/useIsDefaultNetwork"
import { UnknownTokenIcon } from "./DappHeader/TransactionIcon/UnknownTokenIcon"
import { NftDetailsArgentXContainer } from "./NftDetailsArgentXContainer"
import { AggregatedSimData } from "../useTransactionSimulatedData"

const { InfoIcon, AlertIcon } = icons

interface BalanceChangeOverviewArgentXProps {
  aggregatedData: AggregatedSimData[]
  transactionReview?: ApiTransactionReviewResponse
}

export const BalanceChangeOverviewArgentX: FC<
  BalanceChangeOverviewArgentXProps
> = ({ aggregatedData, transactionReview }) => {
  const network = useCurrentNetwork()
  const transactionReviewWithType = useMemo(
    () => getTransactionReviewWithType(transactionReview),
    [transactionReview],
  )
  const allTransferSafe = useMemo(
    () => aggregatedData.every((t) => t.safe),
    [aggregatedData],
  )

  const isDefaultNetwork = useIsDefaultNetwork()
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
                <Box color="neutrals.300" fontSize={"2xs"} cursor="pointer">
                  <InfoIcon />
                </Box>
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
                amount = BigInt(amount)
              }
              return (
                <DetailAccordionItem
                  key={[token.address, "transfer", dataIndex].join("-")}
                  isDisabled={isEmpty(approvals) && isEmpty(recipients)}
                >
                  {({ isDisabled }) => (
                    <>
                      {token.type === "erc20" ? (
                        <DetailAccordionButton>
                          <Flex alignItems="center" gap="2">
                            {token.iconUrl ? (
                              <Image src={token.iconUrl} w="5" h="5" />
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
                              amount={amount}
                              decimals={token.decimals}
                            >
                              <P4
                                color={
                                  amount < 0n ? "error.500" : "secondary.500"
                                }
                                fontWeight="medium"
                              >
                                {prettifyTokenAmount({
                                  amount,
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
                            {isDefaultNetwork &&
                              !!usdValue &&
                              usdValue !== "0" && (
                                <L2 color="neutrals.300">
                                  {prettifyCurrencyValue(
                                    bigDecimal.formatCurrency(
                                      bigDecimal.parseCurrencyAbs(usdValue),
                                    ),
                                  )}
                                </L2>
                              )}
                          </Flex>
                        </DetailAccordionButton>
                      ) : (
                        <NftDetailsArgentXContainer
                          contractAddress={token.address}
                          tokenId={token.tokenId}
                          networkId={network.id}
                          dataIndex={dataIndex}
                          totalData={aggregatedData.length}
                          amount={amount}
                          usdValue={usdValue}
                          safe={safe}
                          isDisabled={isDisabled}
                          isDefaultNetwork={isDefaultNetwork}
                        />
                      )}
                      <DetailAccordionPanel>
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
                                approval.amount = BigInt(approval.amount)
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
                                      amount={approval.amount}
                                      decimals={approval.token.decimals}
                                    >
                                      <Text
                                        color={
                                          isUnlimitedAmount(approval.amount)
                                            ? "error.500"
                                            : undefined
                                        }
                                      >
                                        {prettifyTokenAmount({
                                          amount: approval.amount,
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
                                recipient.amount = BigInt(recipient.amount)
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
                                      amount={recipient.amount}
                                      decimals={token.decimals}
                                    >
                                      <Text>
                                        {prettifyTokenAmount({
                                          amount: recipient.amount,
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
