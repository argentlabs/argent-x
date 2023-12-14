import { Input, icons } from ".."
import { MinusIcon } from "@chakra-ui/icons"
import { Flex, IconButton, chakra, useOutsideClick } from "@chakra-ui/react"
import { FC, useRef } from "react"

const { AddIcon, TickIcon } = icons

const RoundedButton = chakra(IconButton, {
  baseStyle: {
    backgroundColor: "neutrals.700",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 8,
    minWidth: 8,
    padding: 2,
  },
})

interface FloatingFormProps {
  onClose: () => void
  onReduce?: () => void
  onIncrease?: () => void
  onConfirm?: () => void
  value?: number
  onChange: (value: number) => void
  max?: number
  min?: number
}

export const FloatingForm: FC<FloatingFormProps> = ({
  onClose,
  onConfirm,
  onIncrease,
  onReduce,
  value,
  onChange,
  max,
  min,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick({
    ref: ref,
    handler: onClose,
  })
  const isBelowMin = Boolean(value && min && value <= min)
  const isAboveMax = Boolean(value && max && value > max)
  return (
    <Flex
      gap="1"
      p="2"
      bg="black"
      border="1px solid"
      borderColor="neutrals.700"
      borderRadius="full"
      boxShadow="menu"
      position={"absolute"}
      top={0}
      transform={"translateY(-100%)"}
      ref={ref}
    >
      {onReduce && (
        <RoundedButton
          rounded="full"
          size="xs"
          aria-label="Decrease"
          disabled={isBelowMin}
          onClick={onReduce}
          icon={<MinusIcon width={2} height={2} />}
        />
      )}
      <Input
        min={min}
        max={max}
        value={value}
        size="xs"
        minW={20}
        borderRadius="lg"
        type="number"
        onChange={(e) => onChange(parseInt(e.target.value))}
      />
      {onIncrease && (
        <RoundedButton
          rounded="full"
          size="xs"
          backgroundColor="neutrals.700"
          aria-label="Increase"
          disabled={isAboveMax}
          onClick={onIncrease}
          icon={<AddIcon />}
        />
      )}
      {onConfirm && (
        <RoundedButton
          rounded="full"
          size="xs"
          backgroundColor="neutrals.700"
          aria-label="Confirm"
          disabled={Boolean(!value)}
          onClick={onConfirm}
          icon={<TickIcon />}
        />
      )}
    </Flex>
  )
}
