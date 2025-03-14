import type { FC } from "react"
import type { BaseToken } from "../../../../../shared/token/__new/types/token.model"
import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from "@chakra-ui/react"
import { H5, HeaderCell, L2Bold, L3, P4Bold } from "@argent/x-ui"

import type { MinBalances } from "./FeeTokenOptionContainer"
import { FeeTokenOptionContainer } from "./FeeTokenOptionContainer"
import type { EstimatedFeesV2 } from "@argent/x-shared/simulation"
import type { TokenWithBalance } from "@argent/x-shared"
import {
  estimatedFeesToMaxFeeTotalV2,
  estimatedFeesToTotalV2,
  getNativeEstimatedFeeByFeeToken,
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "@argent/x-shared"
import {
  useCurrencyDisplayEnabled,
  useTokenAmountToCurrencyValue,
} from "../../../accountTokens/tokenPriceHooks"

export interface FeeTokenPickerModalProps {
  onClose: () => void
  onFeeTokenSelect: (token: BaseToken) => void
  isOpen: boolean
  tokens: TokenWithBalance[]
  minBalances?: MinBalances
  initialFocusRef?: React.RefObject<HTMLDivElement>
  estimatedFees?: EstimatedFeesV2[]
  feeToken: TokenWithBalance
}

export const FeeTokenPickerModal: FC<FeeTokenPickerModalProps> = ({
  onClose,
  onFeeTokenSelect,
  isOpen,
  tokens,
  minBalances = {},
  initialFocusRef,
  estimatedFees,
  feeToken,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      initialFocusRef={initialFocusRef}
    >
      <ModalContent bg="surface-default">
        <ModalHeader>
          <H5 fontWeight="600" textAlign="center">
            Select fee token
          </H5>
        </ModalHeader>
        <ModalCloseButton autoFocus={false} />
        <ModalBody display="flex" flexDirection="column" px={4} py={2} gap={2}>
          {estimatedFees && (
            <EstimatedFeeBox
              estimatedFees={estimatedFees}
              feeToken={feeToken}
            />
          )}
          <HeaderCell pt={2}>
            <H5>Available</H5>
          </HeaderCell>
          {tokens.map((token, i) => (
            <FeeTokenOptionContainer
              key={token.address}
              ref={i === 0 ? initialFocusRef : undefined}
              onFeeTokenSelect={onFeeTokenSelect}
              token={token}
              minBalances={minBalances}
              borderRadius="xl"
            />
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

type EstimatedFeeBoxProps = Pick<
  FeeTokenPickerModalProps,
  "feeToken" | "estimatedFees"
>

const EstimatedFeeBox = ({ feeToken, estimatedFees }: EstimatedFeeBoxProps) => {
  const showCurrencyValue = useCurrencyDisplayEnabled()
  const fee = getNativeEstimatedFeeByFeeToken(estimatedFees, feeToken.address)

  const amount = fee && estimatedFeesToTotalV2(fee)
  const maxFee = fee && estimatedFeesToMaxFeeTotalV2(fee)

  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    showCurrencyValue && feeToken ? feeToken : undefined,
    amount,
  ) // will return undefined if no feeToken or showCurrencyValue is false

  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    showCurrencyValue && feeToken ? feeToken : undefined,
    maxFee,
  )

  return (
    <Box bg="surface-elevated" rounded="lg" boxShadow="elevated">
      <Flex direction="column" gap="3px" px={4} py={3.5}>
        <Flex justify="space-between">
          <P4Bold color="text-secondary">Estimated fee</P4Bold>
          <H5>
            {amountCurrencyValue
              ? prettifyCurrencyValue(amountCurrencyValue)
              : prettifyTokenAmount({
                  amount,
                  decimals: feeToken?.decimals ?? 18,
                  symbol: feeToken?.symbol,
                })}
          </H5>
        </Flex>

        <Flex justify="space-between">
          <L3 color="text-secondary">Max fee</L3>
          <L2Bold color="text-secondary">
            {suggestedMaxFeeCurrencyValue
              ? prettifyCurrencyValue(suggestedMaxFeeCurrencyValue)
              : prettifyTokenAmount({
                  amount: maxFee,
                  decimals: feeToken?.decimals ?? 18,
                  symbol: feeToken?.symbol,
                })}
          </L2Bold>
        </Flex>
      </Flex>
    </Box>
  )
}
