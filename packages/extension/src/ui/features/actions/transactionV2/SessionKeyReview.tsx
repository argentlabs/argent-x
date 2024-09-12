import {
  ensureDecimals,
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "@argent/x-shared"
import {
  L2,
  ModalDialogData,
  P4,
  TokenIcon,
  UnknownTokenIcon,
  formatDateTime,
} from "@argent/x-ui"
import { Button, Flex, FlexProps, useDisclosure } from "@chakra-ui/react"
import { FC } from "react"
import { TypedData } from "@starknet-io/types-js"

import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useToken } from "../../accountTokens/tokens.state"
import { getActiveFromNow } from "../../smartAccount/escape/useAccountEscape"
import {
  SessionKeyMetadataTxFee,
  isSessionKeyMessage,
  isSessionKeyTypedData,
  sessionKeyMessageSchema,
} from "../../../../shared/sessionKeys/schema"

interface SessionKeyReviewProps {
  dataToSign: TypedData
  networkId: string
}

export const SessionKeyReview: FC<SessionKeyReviewProps> = ({
  dataToSign,
  networkId,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { message } = dataToSign
  if (
    !isSessionKeyTypedData(dataToSign) ||
    !isSessionKeyMessage(dataToSign.message)
  ) {
    return null
  }
  const parsedDataToSign = sessionKeyMessageSchema.parse(message)
  const data = JSON.stringify(parsedDataToSign["Allowed Methods"], null, 2)
  const { activeFromNowPretty } = getActiveFromNow(
    parsedDataToSign["Expires At"],
  )

  return (
    <>
      <ModalDialogData
        title="Allowed methods"
        data={data}
        isOpen={isOpen}
        onClose={onClose}
      />
      <Flex direction="column" gap={1}>
        <Flex
          p={3}
          mb={2}
          rounded="lg"
          border="1px solid"
          borderColor="stroke-focused"
          bgColor="surface-match-mode"
        >
          <P4 color="text-secondary">
            A session allows a dapp to perform actions without asking for your
            permission each time
          </P4>
        </Flex>
        {parsedDataToSign.Metadata.txFees.map(
          ({ tokenAddress, maxAmount }, index) => {
            return (
              <TxFeeCell
                key={`${tokenAddress}-${maxAmount}-${index}`}
                tokenAddress={tokenAddress}
                maxAmount={maxAmount}
                networkId={networkId}
              />
            )
          },
        )}
        <ReviewCell>
          <P4>Expires</P4>
          <Flex
            direction="column"
            gap={0.5}
            justifyContent="flex-end"
            textAlign="right"
          >
            <P4 fontWeight="semibold" color="text-primary">
              In {activeFromNowPretty}
            </P4>
            <L2>{formatDateTime(parsedDataToSign["Expires At"] * 1000)}</L2>
          </Flex>
        </ReviewCell>
        <Button
          onClick={onOpen}
          size={"sm"}
          colorScheme={"transparent"}
          color="text-secondary"
          mx={"auto"}
        >
          See allowed actions
        </Button>
      </Flex>
    </>
  )
}

function ReviewCell(props: FlexProps) {
  return (
    <Flex
      p={3}
      bgColor="surface-elevated"
      rounded="lg"
      alignItems="center"
      justifyContent="space-between"
      color="text-secondary"
      {...props}
    />
  )
}

function TxFeeCell({
  tokenAddress,
  maxAmount,
  networkId,
}: SessionKeyMetadataTxFee & { networkId: string }) {
  const token = useToken({
    networkId,
    address: tokenAddress,
  })
  const currencyValue = useTokenAmountToCurrencyValue(token, maxAmount)
  const displayAmount = token
    ? prettifyTokenAmount({
        amount: maxAmount,
        decimals: ensureDecimals(token.decimals),
        symbol: token.symbol,
      })
    : maxAmount

  return (
    <ReviewCell>
      <Flex direction="column" gap={0.5}>
        <P4 fontWeight="semibold">Max allowed spending</P4>
        <L2>*only applies to transaction fees</L2>
      </Flex>
      <Flex
        direction="column"
        gap={0.5}
        justifyContent="flex-end"
        textAlign="right"
      >
        <Flex gap={1}>
          {token ? (
            <TokenIcon url={token.iconUrl} name={token.name} size={4} />
          ) : (
            <UnknownTokenIcon size={4} />
          )}
          <P4 fontWeight="semibold" color="text-primary">
            {displayAmount}
          </P4>
        </Flex>
        <L2>{prettifyCurrencyValue(currencyValue)}</L2>
      </Flex>
    </ReviewCell>
  )
}
