import { Input, icons } from "@argent/ui"
import { useUserState } from "@argent/x-swap"
import { MinusIcon } from "@chakra-ui/icons"
import { Flex, IconButton, chakra, useOutsideClick } from "@chakra-ui/react"
import { FC, useRef } from "react"

const { AddIcon } = icons

const MAX_SLIPPAGE = 1_000

const UpdateSlippageButton = chakra(IconButton, {
  baseStyle: {
    backgroundColor: "neutrals.700",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "24px",
    minWidth: "24px",
    padding: "8px",
  },
})

interface SlippageFormProps {
  closeHandler: () => void
}

const SlippageForm: FC<SlippageFormProps> = ({ closeHandler }) => {
  const { updateUserSlippageTolerance, userSlippageTolerance } = useUserState()
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick({
    ref: ref,
    handler: closeHandler,
  })

  return (
    <Flex
      gap="1"
      p="2"
      bg="black"
      borderRadius="full"
      borderColor="neutrals.700"
      position={"absolute"}
      top={0}
      transform={"translateY(-100%)"}
      ref={ref}
    >
      <UpdateSlippageButton
        rounded="full"
        size="xs"
        aria-label="Decrease slippage tolerance"
        disabled={userSlippageTolerance <= 0}
        onClick={() => {
          const updatedValue = userSlippageTolerance - 20
          updateUserSlippageTolerance(updatedValue < 0 ? 0 : updatedValue)
        }}
        icon={<MinusIcon width={2} height={2} />}
      />
      <Input
        min={0}
        max={10}
        value={userSlippageTolerance / 100}
        size="xs"
        w="46px"
        borderRadius="lg"
        type="number"
        onChange={(e) => {
          const value =
            +e.target.value > 10 ? MAX_SLIPPAGE : +e.target.value * 100
          updateUserSlippageTolerance(value)
        }}
      />
      <UpdateSlippageButton
        rounded="full"
        size="xs"
        backgroundColor="neutrals.700"
        aria-label="Increase slippage tolerance"
        disabled={userSlippageTolerance >= MAX_SLIPPAGE}
        onClick={() => {
          console.log(userSlippageTolerance)
          const updatedValue = userSlippageTolerance + 20
          console.log(updatedValue)
          updateUserSlippageTolerance(
            updatedValue > MAX_SLIPPAGE ? MAX_SLIPPAGE : updatedValue,
          )
        }}
        icon={<AddIcon />}
      />
    </Flex>
  )
}

export { SlippageForm }
