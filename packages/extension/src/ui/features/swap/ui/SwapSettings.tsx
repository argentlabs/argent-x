import { B2, H5, NavigationBar, P4 } from "@argent/x-ui"

import { isAllowedNumericInputValue } from "@argent/x-shared"
import { BarCloseButton } from "@argent/x-ui"
import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react"
import { isEmpty, isNumber } from "lodash-es"
import type { FC } from "react"
import { useCallback, useState } from "react"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { ConfirmScreen } from "../../actions/transaction/ApproveTransactionScreen/ConfirmScreen"
import { useUserState } from "../state/user"

const MAX_SLIPPAGE = 10000
const DEFAULT_SLIPPAGE_VALUES = [0.1, 0.3, 0.5, 1]

export const SwapSettings: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const { updateUserSlippageTolerance, userSlippageTolerance } = useUserState()
  const [localSlippage, localSlippageHandler] = useState(userSlippageTolerance)
  const [slippage, setSlippage] = useState<string>(
    isNaN(localSlippage) ? "" : (localSlippage / 100).toString(),
  )
  const onSave = useCallback(() => {
    if (isNumber(localSlippage)) {
      updateUserSlippageTolerance(localSlippage)
      onBack()
    }
  }, [localSlippage, onBack, updateUserSlippageTolerance])

  const onSlippageButtonClick = (value: number) => {
    localSlippageHandler(value * 100)
    setSlippage(value.toString())
  }

  type SlippageInputEvent = React.ChangeEvent<HTMLInputElement>

  const parseSlippageValue = (value: string): number => {
    const normalizedValue = value.replace(",", ".")
    return parseFloat(normalizedValue) * 100
  }

  const handleOnChange = (e: SlippageInputEvent) => {
    const inputString = e.target.value
    const [_, decimal] = inputString.replace(",", ".").split(".")

    // Prevent more than 2 decimal places
    if (decimal && decimal.length > 2) {
      return
    }

    // Prevent invalid numeric input
    if (!isAllowedNumericInputValue(inputString.replace(",", "."), 2)) {
      return
    }

    if (isEmpty(inputString)) {
      setSlippage(inputString)
      localSlippageHandler(0)
      return
    }

    const parsedValue = parseSlippageValue(inputString)

    if (isNaN(parsedValue)) {
      setSlippage(inputString)
      return
    }

    const roundedValue = Math.round(parsedValue)
    const clampedValue = Math.min(roundedValue, MAX_SLIPPAGE)

    localSlippageHandler(clampedValue)
    setSlippage(
      roundedValue > MAX_SLIPPAGE
        ? (MAX_SLIPPAGE / 100).toString()
        : inputString,
    )
  }

  return (
    <Flex flexDirection="column" zIndex="1000">
      <NavigationBar
        id="swap-settings-navigation-bar"
        rightButton={<BarCloseButton onClick={onBack} />}
        title={"Slippage"}
        borderBottom="1px solid"
        borderBottomColor="stroke-subtle"
      />
      <ConfirmScreen confirmButtonText="Save" singleButton onSubmit={onSave}>
        <H5 color="text-secondary">Edit slippage</H5>
        <InputGroup size="sm">
          <Input
            type="text"
            value={slippage}
            placeholder="0.00"
            size="sm"
            w="full"
            onChange={handleOnChange}
          />
          <InputRightElement pointerEvents="none" color="text-subtle">
            %
          </InputRightElement>
        </InputGroup>
        <Flex gap={2} w="full">
          {DEFAULT_SLIPPAGE_VALUES.map((value) => (
            <Button
              key={value}
              size="2xs"
              colorScheme="secondary"
              flex={1}
              onClick={() => onSlippageButtonClick(value)}
            >
              <B2>{value}%</B2>
            </Button>
          ))}
        </Flex>
        <P4 color="text-secondary">
          Your transaction will fail if the price changes more than the
          slippage. Too high of a value will result in an unfavourable trade.
        </P4>
      </ConfirmScreen>
    </Flex>
  )
}
