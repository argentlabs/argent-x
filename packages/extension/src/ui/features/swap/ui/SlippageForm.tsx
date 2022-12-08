import { Input, icons } from "@argent/ui"
import { useUserState } from "@argent/x-swap"
import { MinusIcon } from "@chakra-ui/icons"
import { Flex, IconButton, ResponsiveValue, chakra } from "@chakra-ui/react"
import { FC, useCallback, useState } from "react"

const { AddIcon } = icons

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

const SlippageForm = () => {
  const { updateUserSlippageTolerance, userSlippageTolerance } = useUserState()
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
    >
      <UpdateSlippageButton
        rounded="full"
        size="xs"
        aria-label="Decrease slippage tolerance"
        /* disabled={userSlippageTolerance - 20 < 0} */
        onClick={() => updateUserSlippageTolerance(userSlippageTolerance - 20)}
        icon={<MinusIcon width={2} height={2} />}
      />
      <Input
        value={userSlippageTolerance / 100}
        size="xs"
        w="46px"
        borderRadius="lg"
        type="number"
        onChange={(e) => {
          updateUserSlippageTolerance(+e.target.value * 100)
        }}
      />
      <UpdateSlippageButton
        rounded="full"
        size="xs"
        backgroundColor="neutrals.700"
        aria-label="Increase slippage tolerance"
        /* disabled={userSlippageTolerance - 20 < 0} */
        onClick={() => updateUserSlippageTolerance(userSlippageTolerance + 20)}
        icon={<AddIcon />}
      />
    </Flex>
  )
}

export { SlippageForm }
